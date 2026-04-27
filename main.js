const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs/promises");
const fssync = require("fs");
const os = require("os");
const path = require("path");
const net = require("net");
const readline = require("readline");
const { execFile } = require("child_process");
const https = require("https");

const APP_CONFIG_PATH = path.join(app.getPath("userData"), "openclaw-console.config.json");
const HOME = os.homedir();

const DEFAULT_CONFIG = {
  refreshIntervalMs: 5000,
  runtime: {
    openclawConfigPath: path.join(HOME, ".openclaw", "openclaw.json"),
    openclawRootDir: path.join(HOME, ".openclaw"),
    openclawCliPath: path.join(HOME, ".npm-global", "bin", "openclaw"),
    openclawPackagePath: path.join(HOME, ".npm-global", "lib", "node_modules", "openclaw", "package.json")
  }
};

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1080,
    minHeight: 760,
    backgroundColor: "#efe4cf",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  window.loadFile(path.join(__dirname, "src/index.html"));
}

  app.whenReady().then(() => {
  ipcMain.handle("config:read", readConfig);
  ipcMain.handle("config:write", (_, nextConfig) => writeConfig(nextConfig));
  ipcMain.handle("dashboard:load", (_, config) => loadDashboard(config));
  ipcMain.handle("gateway:restart", (_, config) => restartGateway(config));
  ipcMain.handle("model:switch", (_, payload) => switchModel(payload.config, payload.modelId));
  ipcMain.handle("deepseek:chat", (_, payload) => chatWithDeepSeek(payload));

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

async function readConfig() {
  try {
    const raw = await fs.readFile(APP_CONFIG_PATH, "utf8");
    return mergeConfig(JSON.parse(raw));
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeConfig(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
    throw error;
  }
}

async function writeConfig(nextConfig) {
  const merged = mergeConfig(nextConfig);
  await fs.mkdir(path.dirname(APP_CONFIG_PATH), { recursive: true });
  await fs.writeFile(APP_CONFIG_PATH, JSON.stringify(merged, null, 2));
  return merged;
}

function mergeConfig(nextConfig = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...nextConfig,
    runtime: {
      ...DEFAULT_CONFIG.runtime,
      ...(nextConfig.runtime || {})
    }
  };
}

async function loadDashboard(configInput) {
  const config = mergeConfig(configInput);
  const openclawConfig = await loadOpenClawConfig(config.runtime.openclawConfigPath);
  const rootDir = config.runtime.openclawRootDir;
  const gatewayPort = Number(openclawConfig.gateway?.port) || 18789;

  const [packageVersion, gateway, usage, agent] = await Promise.all([
    readInstalledVersion(config.runtime.openclawPackagePath, openclawConfig),
    getGatewayStatus({
      port: gatewayPort,
      logPath: path.join(rootDir, "logs", "gateway.log"),
      errLogPath: path.join(rootDir, "logs", "gateway.err.log"),
      token: openclawConfig.gateway?.auth?.token || ""
    }),
    collectUsage(rootDir),
    getAgentStatus(openclawConfig, rootDir)
  ]);

  const models = collectConfiguredModels(openclawConfig);
  const currentModel = openclawConfig.agents?.defaults?.model?.primary || models[0]?.id || null;

  for (const model of models) {
    model.active = model.id === currentModel;
  }

  return {
    version: packageVersion,
    gateway,
    agent,
    currentModel,
    models,
    usage,
    runtime: {
      configPath: config.runtime.openclawConfigPath,
      rootDir,
      cliPath: config.runtime.openclawCliPath,
      gatewayPort
    },
    sourceError: null
  };
}

async function restartGateway(configInput) {
  const config = mergeConfig(configInput);
  const openclawConfig = await loadOpenClawConfig(config.runtime.openclawConfigPath);
  const port = Number(openclawConfig.gateway?.port) || 18789;

  const attempts = [
    [config.runtime.openclawCliPath, ["gateway", "restart"]],
    [config.runtime.openclawCliPath, ["gateway", "start"]],
    ["/bin/launchctl", ["kickstart", "-k", `gui/${process.getuid()}/ai.openclaw.gateway`]]
  ];

  let lastError = null;
  for (const [command, args] of attempts) {
    try {
      const result = await execFileAsync(command, args, { timeout: 20000 });
      return {
        ok: true,
        message: result.stdout.trim() || `网关重启命令已执行，目标端口 ${port}`
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(lastError?.stderr?.trim() || lastError?.message || "无法重启网关");
}

async function switchModel(configInput, modelId) {
  const config = mergeConfig(configInput);
  const openclawConfig = await loadOpenClawConfig(config.runtime.openclawConfigPath);
  const models = collectConfiguredModels(openclawConfig);
  const target = models.find((item) => item.id === modelId);

  if (!target) {
    throw new Error(`模型未配置: ${modelId}`);
  }

  openclawConfig.agents = openclawConfig.agents || {};
  openclawConfig.agents.defaults = openclawConfig.agents.defaults || {};
  openclawConfig.agents.defaults.model = openclawConfig.agents.defaults.model || {};
  openclawConfig.agents.defaults.model.primary = target.id;

  await fs.writeFile(config.runtime.openclawConfigPath, JSON.stringify(openclawConfig, null, 2));
  await restartGateway(config);

  return {
    ok: true,
    message: `已切换默认模型到 ${target.label}`
  };
}

async function loadOpenClawConfig(configPath) {
  const raw = await fs.readFile(configPath, "utf8");
  return JSON.parse(raw);
}

async function readInstalledVersion(packagePath, configObject) {
  try {
    const raw = await fs.readFile(packagePath, "utf8");
    const parsed = JSON.parse(raw);
    const installed = parsed.version || "unknown";
    const touched = configObject.meta?.lastTouchedVersion;
    return touched ? `${installed} / cfg ${touched}` : installed;
  } catch {
    return configObject.meta?.lastTouchedVersion || "unknown";
  }
}

async function getGatewayStatus({ port, logPath, errLogPath, token }) {
  const probe = await probePort(port);
  const [lastLogLine, lastErrLine] = await Promise.all([
    readLastMeaningfulLine(logPath),
    readLastMeaningfulLine(errLogPath)
  ]);

  return {
    status: probe.online ? "online" : "offline",
    latencyMs: probe.latencyMs,
    updatedAt: lastIsoFromText(lastLogLine) || null,
    port,
    authMode: token ? "token" : "none",
    tokenPreview: token ? `${token.slice(0, 8)}...` : "",
    detail: probe.online ? (lastLogLine || "TCP 连接正常") : (lastErrLine || lastLogLine || "未检测到监听")
  };
}

async function getAgentStatus(openclawConfig, rootDir) {
  const sessionsPath = path.join(rootDir, "agents", "main", "sessions", "sessions.json");
  let sessions = {};

  try {
    sessions = JSON.parse(await fs.readFile(sessionsPath, "utf8"));
  } catch {
    sessions = {};
  }

  const entries = Object.values(sessions);
  const latestUpdatedAt = entries
    .map((entry) => Number(entry.updatedAt || 0))
    .filter(Boolean)
    .sort((a, b) => b - a)[0] || null;

  const agentsList = Array.isArray(openclawConfig.agents?.list) ? openclawConfig.agents.list : [];
  const primary = openclawConfig.agents?.defaults?.model?.primary || "unknown";

  return {
    status: latestUpdatedAt ? "active" : "idle",
    workers: Number(openclawConfig.agents?.defaults?.maxConcurrent) || agentsList.length || 1,
    queueDepth: 0,
    configuredAgents: agentsList.length,
    primaryModel: primary,
    lastActiveAt: latestUpdatedAt
  };
}

function collectConfiguredModels(openclawConfig) {
  const result = [];
  const seen = new Set();
  const providerConfigs = openclawConfig.models?.providers || {};
  const aliases = openclawConfig.agents?.defaults?.models || {};

  for (const [providerId, provider] of Object.entries(providerConfigs)) {
    for (const item of provider.models || []) {
      const id = `${providerId}/${item.id}`;
      seen.add(id);
      result.push({
        id,
        label: item.name || item.id,
        provider: providerId,
        contextWindow: item.contextWindow || item.context || null,
        active: false
      });
    }
  }

  for (const [id, meta] of Object.entries(aliases)) {
    if (seen.has(id)) {
      const existing = result.find((item) => item.id === id);
      if (existing && meta.alias) {
        existing.label = meta.alias;
      }
      continue;
    }

    const [provider = "unknown"] = id.split("/");
    result.push({
      id,
      label: meta.alias || id,
      provider,
      contextWindow: null,
      active: false
    });
  }

  return result.sort((a, b) => a.label.localeCompare(b.label));
}

async function collectUsage(rootDir) {
  const sessionDirs = [
    path.join(rootDir, "agents", "main", "sessions"),
    path.join(rootDir, "agents", "tangyuan", "sessions")
  ];

  const today = new Date().toISOString().slice(0, 10);
  const totals = createUsageBucket();
  const todayTotals = createUsageBucket();

  for (const dir of sessionDirs) {
    await walkUsageFiles(dir, async (filePath) => {
      if (!filePath.endsWith(".jsonl")) return;
      await accumulateUsageFromJsonl(filePath, totals, todayTotals, today);
    });
  }

  await walkUsageFiles(path.join(rootDir, "cron", "runs"), async (filePath) => {
    if (!filePath.endsWith(".jsonl")) return;
    await accumulateUsageFromCron(filePath, totals, todayTotals, today);
  });

  return {
    inputTokens: todayTotals.inputTokens,
    outputTokens: todayTotals.outputTokens,
    totalTokens: todayTotals.totalTokens,
    requests: todayTotals.requests,
    periodLabel: `today / all ${formatCompactNumber(totals.totalTokens)}`
  };
}

function createUsageBucket() {
  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    requests: 0
  };
}

async function accumulateUsageFromJsonl(filePath, totals, todayTotals, todayDate) {
  const stream = fssync.createReadStream(filePath, "utf8");
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;

    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }

    const usage = parsed?.message?.usage;
    if (!usage) continue;

    const normalized = normalizeUsage(usage);
    applyUsageBucket(totals, normalized);

    const dateSource =
      parsed.timestamp ||
      parsed.message?.timestamp ||
      (typeof parsed.ts === "number" ? new Date(parsed.ts).toISOString() : "");

    if (String(dateSource).slice(0, 10) === todayDate) {
      applyUsageBucket(todayTotals, normalized);
    }
  }
}

async function accumulateUsageFromCron(filePath, totals, todayTotals, todayDate) {
  const stream = fssync.createReadStream(filePath, "utf8");
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line.trim()) continue;

    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }

    const usage = parsed?.usage;
    if (!usage) continue;

    const normalized = normalizeUsage(usage);
    applyUsageBucket(totals, normalized);

    const dateSource =
      typeof parsed.runAtMs === "number" ? new Date(parsed.runAtMs).toISOString() : "";
    if (dateSource.slice(0, 10) === todayDate) {
      applyUsageBucket(todayTotals, normalized);
    }
  }
}

function normalizeUsage(usage) {
  const inputTokens = Number(usage.input || usage.input_tokens || usage.promptTokens || 0);
  const outputTokens = Number(usage.output || usage.output_tokens || usage.completionTokens || 0);
  const totalTokens = Number(
    usage.totalTokens ||
      usage.total_tokens ||
      inputTokens + outputTokens
  );

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    requests: 1
  };
}

function applyUsageBucket(target, source) {
  target.inputTokens += source.inputTokens;
  target.outputTokens += source.outputTokens;
  target.totalTokens += source.totalTokens;
  target.requests += source.requests;
}

async function walkUsageFiles(rootDir, visit) {
  let entries = [];
  try {
    entries = await fs.readdir(rootDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      await walkUsageFiles(fullPath, visit);
    } else {
      await visit(fullPath);
    }
  }
}

function probePort(port) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let finished = false;

    const complete = (result) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(1000);
    socket.once("connect", () => {
      complete({ online: true, latencyMs: Date.now() - start });
    });
    socket.once("timeout", () => {
      complete({ online: false, latencyMs: null });
    });
    socket.once("error", () => {
      complete({ online: false, latencyMs: null });
    });
    socket.connect(port, "127.0.0.1");
  });
}

async function readLastMeaningfulLine(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    return lines.at(-1) || "";
  } catch {
    return "";
  }
}

function lastIsoFromText(text) {
  const match = String(text).match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/);
  return match ? match[0] : null;
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("zh-CN", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number(value || 0));
}

function execFileAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, options, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

async function chatWithDeepSeek({ messages, model }) {
  const config = await loadOpenClawConfig(DEFAULT_CONFIG.runtime.openclawConfigPath);
  const deepseekConfig = config.models?.providers?.deepseek;

  if (!deepseekConfig?.apiKey) {
    return { error: "DeepSeek API Key 未配置" };
  }

  const apiKey = deepseekConfig.apiKey;
  const baseUrl = deepseekConfig.baseUrl || "https://api.deepseek.com/v1";
  const modelId = model || "deepseek-chat";

  const requestBody = {
    model: modelId,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: false
  };

  return new Promise((resolve) => {
    const url = new URL(`${baseUrl}/chat/completions`);
    const postData = JSON.stringify(requestBody);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(postData)
      },
      timeout: 60000
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            resolve({ error: parsed.error.message || JSON.stringify(parsed.error) });
            return;
          }

          const choice = parsed.choices?.[0];
          const content = choice?.message?.content || "";
          const usage = parsed.usage
            ? `输入 ${parsed.usage.prompt_tokens} / 输出 ${parsed.usage.completion_tokens}`
            : "";

          resolve({ content, usage });
        } catch (error) {
          resolve({ error: `解析响应失败: ${error.message}` });
        }
      });
    });

    req.on("error", (error) => {
      resolve({ error: `请求失败: ${error.message}` });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ error: "请求超时" });
    });

    req.write(postData);
    req.end();
  });
}

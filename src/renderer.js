const state = {
  config: null,
  refreshTimer: null,
  dashboard: null
};

const elements = {
  configForm: document.getElementById("config-form"),
  refreshBtn: document.getElementById("refresh-btn"),
  restartBtn: document.getElementById("restart-btn"),
  switchModelBtn: document.getElementById("switch-model-btn"),
  modelSelect: document.getElementById("model-select"),
  modelList: document.getElementById("model-list"),
  connectionStatus: document.getElementById("connection-status"),
  actionStatus: document.getElementById("action-status"),
  versionValue: document.getElementById("version-value"),
  updatedAt: document.getElementById("updated-at"),
  gatewayValue: document.getElementById("gateway-value"),
  gatewayLatency: document.getElementById("gateway-latency"),
  agentValue: document.getElementById("agent-value"),
  agentMeta: document.getElementById("agent-meta"),
  currentModel: document.getElementById("current-model"),
  modelProvider: document.getElementById("model-provider"),
  inputTokens: document.getElementById("input-tokens"),
  outputTokens: document.getElementById("output-tokens"),
  totalTokens: document.getElementById("total-tokens"),
  requestsCount: document.getElementById("requests-count"),
  usagePeriod: document.getElementById("usage-period"),
  chatInput: document.getElementById("chat-input"),
  sendBtn: document.getElementById("send-btn"),
  chatMessages: document.getElementById("chat-messages"),
  chatModelSelect: document.getElementById("chat-model-select"),
  clearChatBtn: document.getElementById("clear-chat-btn")
};

const chatState = {
  messages: [],
  isLoading: false
};

bootstrap().catch((error) => {
  elements.connectionStatus.textContent = `初始化失败: ${error.message}`;
});

async function bootstrap() {
  const config = await window.openclawDesktop.readConfig();
  state.config = config;
  fillConfigForm(config);
  bindEvents();
  await refreshDashboard();
  scheduleRefresh();
}

function bindEvents() {
  elements.configForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const config = readConfigForm();
    state.config = await window.openclawDesktop.writeConfig(config);
    elements.actionStatus.textContent = "配置已保存";
    scheduleRefresh();
    await refreshDashboard();
  });

  elements.refreshBtn.addEventListener("click", () => {
    refreshDashboard();
  });

  elements.restartBtn.addEventListener("click", async () => {
    setActionStatus("正在重启网关...");
    try {
      const result = await window.openclawDesktop.restartGateway(state.config);
      setActionStatus(result.message || "网关重启请求已发出");
      await refreshDashboard();
    } catch (error) {
      setActionStatus(`网关重启失败: ${error.message}`);
    }
  });

  elements.switchModelBtn.addEventListener("click", async () => {
    const modelId = elements.modelSelect.value;
    if (!modelId) {
      setActionStatus("没有可切换的模型");
      return;
    }

    setActionStatus(`正在切换模型到 ${modelId}...`);

    try {
      const result = await window.openclawDesktop.switchModel(state.config, modelId);
      setActionStatus(result.message || `已切换到 ${modelId}`);
      await refreshDashboard();
    } catch (error) {
      setActionStatus(`模型切换失败: ${error.message}`);
    }
  });

  elements.sendBtn.addEventListener("click", sendChatMessage);
  elements.chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  });
  elements.clearChatBtn.addEventListener("click", () => {
    chatState.messages = [];
    elements.chatMessages.innerHTML = "";
  });
}

async function sendChatMessage() {
  const text = elements.chatInput.value.trim();
  if (!text || chatState.isLoading) return;

  const model = elements.chatModelSelect.value;
  chatState.messages.push({ role: "user", content: text });
  renderChatMessages();
  elements.chatInput.value = "";
  chatState.isLoading = true;
  renderChatMessages();

  try {
    const result = await window.openclawDesktop.chatWithDeepSeek({
      messages: chatState.messages,
      model
    });

    if (result.error) {
      throw new Error(result.error);
    }

    chatState.messages.push({ role: "assistant", content: result.content });
    setActionStatus(`DeepSeek 回复完成 · ${result.usage || ""}`);
  } catch (error) {
    setActionStatus(`DeepSeek 请求失败: ${error.message}`);
    chatState.messages.push({
      role: "assistant",
      content: `请求出错: ${error.message}`,
      isError: true
    });
  } finally {
    chatState.isLoading = false;
    renderChatMessages();
  }
}

function renderChatMessages() {
  elements.chatMessages.innerHTML = "";

  for (const msg of chatState.messages) {
    const msgEl = document.createElement("div");
    msgEl.className = `chat-message ${msg.role}${msg.isError ? " error" : ""}`;

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = msg.role === "user" ? "我" : "AI";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.innerHTML = formatChatContent(msg.content);

    msgEl.appendChild(avatar);
    msgEl.appendChild(bubble);
    elements.chatMessages.appendChild(msgEl);
  }

  if (chatState.isLoading) {
    const loadingEl = document.createElement("div");
    loadingEl.className = "chat-message assistant loading";
    loadingEl.innerHTML = `
      <div class="chat-avatar">AI</div>
      <div class="chat-bubble">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    `;
    elements.chatMessages.appendChild(loadingEl);
  }

  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function formatChatContent(text) {
  if (!text) return "";
  let html = escapeHtml(text);
  html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\n/g, "<br>");
  return html;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function scheduleRefresh() {
  if (state.refreshTimer) {
    window.clearInterval(state.refreshTimer);
  }

  const interval = Math.max(Number(state.config.refreshIntervalMs) || 5000, 1000);
  state.refreshTimer = window.setInterval(() => {
    refreshDashboard();
  }, interval);
}

async function refreshDashboard() {
  setConnectionStatus("正在拉取状态...");

  try {
    const dashboard = await window.openclawDesktop.loadDashboard(state.config);
    state.dashboard = dashboard;
    renderDashboard(dashboard);
    setConnectionStatus(
      dashboard.gateway.status === "online"
        ? `本机网关在线 · ${dashboard.gateway.detail || "连接正常"}`
        : `本机网关离线 · ${dashboard.gateway.detail || "未监听"}`
    );
  } catch (error) {
    setConnectionStatus(`连接失败: ${error.message}`);
  }
}

function renderDashboard(dashboard) {
  elements.versionValue.textContent = dashboard.version || "-";
  elements.updatedAt.textContent = dashboard.runtime
    ? `配置 ${dashboard.runtime.configPath}`
    : "暂无配置路径";

  elements.gatewayValue.textContent = dashboard.gateway.status || "-";
  elements.gatewayLatency.textContent = dashboard.gateway.latencyMs
    ? `端口 ${dashboard.gateway.port} / ${dashboard.gateway.latencyMs} ms`
    : `端口 ${dashboard.gateway.port} / 无法连接`;

  elements.agentValue.textContent = dashboard.agent.status || "-";
  elements.agentMeta.textContent = [
    dashboard.agent.workers ? `并发 ${dashboard.agent.workers}` : null,
    dashboard.agent.configuredAgents ? `agents ${dashboard.agent.configuredAgents}` : null,
    dashboard.agent.lastActiveAt ? `最近 ${formatTime(dashboard.agent.lastActiveAt)}` : null
  ]
    .filter(Boolean)
    .join(" / ") || "暂无附加信息";

  elements.currentModel.textContent = dashboard.currentModel || "-";
  const activeModel = dashboard.models.find((item) => item.active) || dashboard.models[0];
  elements.modelProvider.textContent = activeModel
    ? `${activeModel.provider} / 上下文 ${formatNumber(activeModel.contextWindow || 0)}`
    : dashboard.agent.primaryModel || "暂无模型信息";

  elements.inputTokens.textContent = formatNumber(dashboard.usage.inputTokens);
  elements.outputTokens.textContent = formatNumber(dashboard.usage.outputTokens);
  elements.totalTokens.textContent = formatNumber(dashboard.usage.totalTokens);
  elements.requestsCount.textContent = formatNumber(dashboard.usage.requests);
  elements.usagePeriod.textContent = `统计周期: ${dashboard.usage.periodLabel || "-"}`;

  renderModelOptions(dashboard.models);
}

function renderModelOptions(models) {
  elements.modelSelect.innerHTML = "";
  elements.modelList.innerHTML = "";

  for (const model of models) {
    const option = document.createElement("option");
    option.value = model.id;
    option.textContent = `${model.label} · ${model.provider}`;
    option.selected = Boolean(model.active);
    elements.modelSelect.appendChild(option);

    const chip = document.createElement("div");
    chip.className = `model-chip ${model.active ? "active" : ""}`;
    chip.innerHTML = `
      <strong>${model.label}</strong>
      <span>${model.provider}</span>
      <em>${formatNumber(model.contextWindow || 0)} ctx</em>
    `;
    elements.modelList.appendChild(chip);
  }

  if (!models.length) {
    elements.modelSelect.innerHTML = '<option value="">暂无模型</option>';
    elements.modelList.innerHTML = '<div class="empty">还没有从接口拿到模型列表</div>';
  }
}

function fillConfigForm(config) {
  document.getElementById("openclawConfigPath").value = config.runtime.openclawConfigPath || "";
  document.getElementById("openclawRootDir").value = config.runtime.openclawRootDir || "";
  document.getElementById("refreshIntervalMs").value = config.refreshIntervalMs || 5000;
  document.getElementById("openclawCliPath").value = config.runtime.openclawCliPath || "";
  document.getElementById("openclawPackagePath").value = config.runtime.openclawPackagePath || "";
}

function readConfigForm() {
  return {
    ...state.config,
    refreshIntervalMs: Number(document.getElementById("refreshIntervalMs").value || 5000),
    runtime: {
      openclawConfigPath: document.getElementById("openclawConfigPath").value.trim(),
      openclawRootDir: document.getElementById("openclawRootDir").value.trim(),
      openclawCliPath: document.getElementById("openclawCliPath").value.trim(),
      openclawPackagePath: document.getElementById("openclawPackagePath").value.trim()
    }
  };
}

function setConnectionStatus(text) {
  elements.connectionStatus.textContent = text;
}

function setActionStatus(text) {
  elements.actionStatus.textContent = text;
}

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN").format(Number(value || 0));
}

function formatTime(value) {
  const date = typeof value === "number" ? new Date(value) : new Date(String(value));
  return date.toLocaleString("zh-CN", { hour12: false });
}

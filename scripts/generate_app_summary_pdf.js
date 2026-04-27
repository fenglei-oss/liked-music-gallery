const fs = require("fs/promises");
const path = require("path");
const { app, BrowserWindow } = require("electron");

const repoRoot = path.resolve(__dirname, "..");
const tmpDir = path.join(repoRoot, "tmp", "pdfs");
const outDir = path.join(repoRoot, "output", "pdf");
const htmlPath = path.join(tmpDir, "openclaw-console-summary-cn.html");
const previewHtmlPath = path.join(tmpDir, "openclaw-console-summary-cn.preview.html");
const pngPath = path.join(tmpDir, "openclaw-console-summary-cn.png");
const pdfPath = path.join(outDir, "openclaw-console-summary-cn.pdf");
const pngFileUrl = `file://${encodeURI(pngPath)}`;

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OpenClaw Console 一页摘要</title>
    <style>
      :root {
        --paper: #f8f3e7;
        --ink: #18211b;
        --muted: #5b645e;
        --line: #d8ccba;
        --accent: #0f766e;
        --accent-soft: #dceee4;
        --warn-soft: #f2e4cf;
      }

      * { box-sizing: border-box; }

      @page {
        size: A4;
        margin: 12mm;
      }

      body {
        margin: 0;
        font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, #fffdf7 0%, rgba(255, 253, 247, 0) 34%),
          linear-gradient(135deg, #f5ebda 0%, #e5d8c3 100%);
      }

      .page {
        width: 210mm;
        min-height: 297mm;
        padding: 12mm;
      }

      .sheet {
        background: rgba(255, 251, 244, 0.94);
        border: 1px solid rgba(24, 33, 27, 0.08);
        border-radius: 20px;
        padding: 9mm 10mm 7.5mm;
        box-shadow: 0 18px 40px rgba(69, 52, 34, 0.10);
      }

      .hero {
        display: grid;
        grid-template-columns: 1.5fr 0.9fr;
        gap: 8mm;
        align-items: start;
        margin-bottom: 5.5mm;
      }

      .eyebrow {
        margin: 0 0 1.4mm;
        font-size: 8.4pt;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: #7b6d54;
      }

      h1 {
        margin: 0 0 2.2mm;
        font-size: 20pt;
        line-height: 1.1;
        font-family: "Songti SC", "STSong", serif;
      }

      .desc {
        margin: 0;
        font-size: 9.2pt;
        line-height: 1.42;
        color: var(--muted);
      }

      .persona {
        padding: 4.2mm;
        background: linear-gradient(150deg, #edf8f3 0%, #dceee4 100%);
        border-radius: 16px;
        border: 1px solid rgba(15, 118, 110, 0.14);
      }

      .persona strong {
        display: block;
        margin-bottom: 1.4mm;
        font-size: 9.4pt;
      }

      .persona p {
        margin: 0;
        font-size: 8.9pt;
        line-height: 1.42;
      }

      .grid {
        display: grid;
        grid-template-columns: 0.95fr 1.05fr;
        gap: 5mm;
      }

      .section {
        margin-bottom: 4mm;
      }

      .section:last-child {
        margin-bottom: 0;
      }

      h2 {
        margin: 0 0 1.8mm;
        font-size: 10.8pt;
        line-height: 1.2;
      }

      .card {
        border: 1px solid var(--line);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.72);
        padding: 3.5mm 4mm;
      }

      ul {
        margin: 0;
        padding-left: 4mm;
      }

      li {
        margin: 0 0 1.45mm;
        font-size: 8.7pt;
        line-height: 1.34;
      }

      li:last-child {
        margin-bottom: 0;
      }

      .mini {
        margin: 0;
        font-size: 8.7pt;
        line-height: 1.36;
      }

      .flow {
        display: grid;
        gap: 1.8mm;
      }

      .step {
        padding: 2.6mm 3.1mm;
        border-radius: 12px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.82);
      }

      .step b {
        color: var(--accent);
      }

      .chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 2mm;
        margin-top: 2mm;
      }

      .chip {
        padding: 1mm 2mm;
        border-radius: 999px;
        background: var(--accent-soft);
        font-size: 7.6pt;
      }

      .note {
        margin-top: 2mm;
        padding: 2.4mm 2.8mm;
        border-radius: 12px;
        background: var(--warn-soft);
        font-size: 8.1pt;
        line-height: 1.32;
      }

      code {
        font-family: "SF Mono", "Menlo", monospace;
        font-size: 7.8pt;
        background: rgba(24, 33, 27, 0.06);
        padding: 0.4mm 1.2mm;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="sheet">
        <div class="hero">
          <div>
            <p class="eyebrow">Repo Summary</p>
            <h1>OpenClaw Console</h1>
            <p class="desc">
              这是一个最小化的 Electron 桌面控制台，用来直接读取本机 OpenClaw 的配置、日志与会话数据，
              展示运行状态，并执行模型切换与网关重启。仓库说明明确指出它按本机实际安装形态接入，
              不依赖此前假设的 REST API。
            </p>
          </div>
          <aside class="persona">
            <strong>适用对象</strong>
            <p>主要面向在本机运行 OpenClaw、需要查看运行状态、核对用量并切换默认模型的开发者或运维操作者。</p>
          </aside>
        </div>

        <div class="grid">
          <div>
            <section class="section">
              <h2>它能做什么</h2>
              <div class="card">
                <ul>
                  <li>显示本机 OpenClaw 安装版本号。</li>
                  <li>探测网关在线/离线状态，并显示端口与延迟。</li>
                  <li>读取主 agent 状态与最近活跃时间。</li>
                  <li>列出当前已配置模型，并标记默认模型。</li>
                  <li>直接改写 <code>openclaw.json</code> 切换默认模型。</li>
                  <li>一键重启网关，失败时按多种命令顺序回退尝试。</li>
                  <li>汇总本地 session 与 cron 运行的 token / 请求量。</li>
                </ul>
              </div>
            </section>

            <section class="section">
              <h2>如何运行</h2>
              <div class="card">
                <ul>
                  <li>安装依赖：<code>npm install</code></li>
                  <li>启动应用：<code>npm start</code></li>
                  <li>默认读取：<code>~/.openclaw/openclaw.json</code>、<code>~/.openclaw/</code>、<code>~/.npm-global/bin/openclaw</code></li>
                  <li>如果安装路径不同，可在左侧配置面板改路径。</li>
                  <li>Node.js 版本要求：Not found in repo</li>
                </ul>
              </div>
            </section>
          </div>

          <div>
            <section class="section">
              <h2>工作方式（基于仓库证据）</h2>
              <div class="card flow">
                <div class="step"><b>1. UI 层</b>：<code>src/index.html</code> + <code>src/renderer.js</code> 提供配置表单、状态卡片、模型切换和手动刷新。</div>
                <div class="step"><b>2. IPC 桥接</b>：<code>preload.js</code> 用 <code>contextBridge</code> 暴露 <code>readConfig</code>、<code>loadDashboard</code>、<code>restartGateway</code>、<code>switchModel</code>。</div>
                <div class="step"><b>3. 主进程与本机数据</b>：<code>main.js</code> 注册 IPC 处理器，读取 <code>openclaw.json</code>、安装目录 <code>package.json</code>、<code>gateway*.log</code>、<code>sessions.json</code> 与各类 <code>.jsonl</code>。</div>
                <div class="step"><b>4. 数据流与控制</b>：Renderer 发起操作 → Preload IPC → Main 访问文件系统 / TCP / CLI；模型切换会改写配置并触发网关重启。远程 API、数据库、服务端持久层：Not found in repo。</div>
              </div>
              <p class="mini">Windows / Linux 打包信息：Not found in repo；仓库只显式提供了 macOS 目录构建脚本与配置。</p>
            </section>
          </div>
        </div>

      </section>
    </main>
  </body>
</html>`;

const previewHtml = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <style>
      @page { size: A4; margin: 0; }
      html, body {
        margin: 0;
        width: 210mm;
        height: 297mm;
        overflow: hidden;
        background: #f5ebda;
      }
      img {
        display: block;
        width: 210mm;
        height: 297mm;
        object-fit: fill;
      }
    </style>
  </head>
  <body>
    <img src="${pngFileUrl}" alt="summary" />
  </body>
</html>`;

async function ensureDirs() {
  await fs.mkdir(tmpDir, { recursive: true });
  await fs.mkdir(outDir, { recursive: true });
}

async function writeHtml() {
  await fs.writeFile(htmlPath, html, "utf8");
  await fs.writeFile(previewHtmlPath, previewHtml, "utf8");
}

async function renderPdf() {
  const summaryWin = new BrowserWindow({
    show: false,
    width: 794,
    height: 1123,
    backgroundColor: "#f5ebda"
  });

  await summaryWin.loadFile(htmlPath);
  await summaryWin.webContents.executeJavaScript(
    "document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true)"
  );
  await new Promise((resolve) => setTimeout(resolve, 300));

  const image = await summaryWin.webContents.capturePage();
  await fs.writeFile(pngPath, image.toPNG());
  await summaryWin.close();

  const pdfWin = new BrowserWindow({
    show: false,
    width: 794,
    height: 1123,
    backgroundColor: "#f5ebda"
  });

  await pdfWin.loadFile(previewHtmlPath);
  await pdfWin.webContents.executeJavaScript(
    "document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true)"
  );

  const pdf = await pdfWin.webContents.printToPDF({
    printBackground: true,
    pageSize: "A4",
    landscape: false,
    margins: {
      marginType: "none"
    },
    preferCSSPageSize: true
  });

  await fs.writeFile(pdfPath, pdf);
  await pdfWin.close();
}

app.whenReady().then(async () => {
  try {
    await ensureDirs();
    await writeHtml();
    await renderPdf();
    console.log(pdfPath);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    app.quit();
  }
});

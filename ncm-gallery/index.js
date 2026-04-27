#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

const CONFIG_PATH = path.join(os.homedir(), ".config", "ncm-gallery", "config.json");
const OUTPUT_DIR = path.join(process.cwd(), "ncm-gallery-output");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveConfig(config) {
  ensureDir(path.dirname(CONFIG_PATH));
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log("配置已保存:", CONFIG_PATH);
}

function checkNcm() {
  try {
    execSync("command -v ncm", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkNcmLogin() {
  try {
    const result = execSync("ncm me --json 2>/dev/null", { encoding: "utf8", timeout: 10000 });
    const data = JSON.parse(result);
    return data?.profile?.nickname || null;
  } catch {
    return null;
  }
}

const commands = {
  async login() {
    if (!checkNcm()) {
      console.log("❌ 未找到 ncm-cli，请先安装：");
      console.log("   npx --yes github:Davied-H/ncm-cli install --dir ~/.local/bin --with-playwright-driver");
      return;
    }
    const nickname = checkNcmLogin();
    if (nickname) {
      console.log(`✅ 已登录网易云音乐: ${nickname}`);
    } else {
      console.log("正在打开网易云音乐登录页面...");
      execSync("ncm login", { stdio: "inherit" });
      const newNick = checkNcmLogin();
      if (newNick) {
        console.log(`✅ 登录成功: ${newNick}`);
      } else {
        console.log("❌ 登录失败，请重试");
      }
    }
  },

  async build() {
    // Check ncm-cli
    if (!checkNcm()) {
      console.log("❌ 未安装 ncm-cli，请先运行: npx ncm-gallery login");
      return;
    }

    const nickname = checkNcmLogin();
    if (!nickname) {
      console.log("❌ 未登录网易云音乐，请先运行: node index.js login");
      return;
    }
    console.log(`✅ 已登录: ${nickname}`);

    // Load config
    let config = loadConfig();
    if (!config.deepseekApiKey) {
      const readline = require("readline").createInterface({
        input: process.stdin, output: process.stdout
      });
      config.deepseekApiKey = await new Promise((resolve) => {
        readline.question("🔑 请输入你的 DeepSeek API Key (https://platform.deepseek.com): ", (key) => {
          readline.close();
          resolve(key.trim());
        });
      });
      saveConfig(config);
    }

    // Step 1: Fetch liked songs
    console.log("\n📀 正在获取你的喜欢歌单...");
    try {
      const { fetchLikedSongs, fetchSongDetails, downloadCovers } = require("./fetch-songs");
      console.log("   获取歌单列表...");
      const likedId = await fetchLikedSongs();
      console.log(`   歌单 ID: ${likedId}`);

      console.log("   获取歌曲详情...");
      const tracks = await fetchSongDetails(likedId);
      console.log(`   共 ${tracks.length} 首歌曲`);

      // Step 2: Download covers
      ensureDir(OUTPUT_DIR);
      const coverDir = path.join(OUTPUT_DIR, "covers");
      ensureDir(coverDir);
      console.log("\n🖼️  下载专辑封面...");
      await downloadCovers(tracks, coverDir);

      // Step 3: Generate bios
      console.log("\n🤖 正在生成艺人介绍和歌曲介绍...");
      const { generateBios } = require("./generate-bios");
      const { artistBios, songNotes } = await generateBios(tracks, config.deepseekApiKey);

      // Step 4: Build HTML
      console.log("\n🏗️  构建画廊页面...");
      const { buildGallery } = require("./build-gallery");
      const htmlPath = await buildGallery({
        tracks,
        artistBios,
        songNotes,
        nickname,
        coverDir,
        outputDir: OUTPUT_DIR,
      });

      console.log(`\n✅ 完成！页面已生成:`);
      console.log(`   ${htmlPath}`);
      console.log(`\n💡 查看方式: open "${htmlPath}"`);
    } catch (err) {
      console.error("❌ 构建失败:", err.message);
    }
  },

  async serve() {
    const htmlPath = path.join(OUTPUT_DIR, "gallery.html");
    if (!fs.existsSync(htmlPath)) {
      console.log("❌ 尚未构建页面，请先运行: node index.js build");
      return;
    }
    const { execSync } = require("child_process");
    console.log("🌐 启动本地预览服务器...");
    console.log(`   访问: http://localhost:8899`);
    execSync(`open "${htmlPath}"`, { stdio: "ignore" });
    require("http").createServer((req, res) => {
      const filePath = path.join(OUTPUT_DIR, req.url === "/" ? "gallery.html" : req.url);
      try {
        const content = fs.readFileSync(filePath);
        const ext = path.extname(filePath);
        const mime = { ".html": "text/html", ".jpg": "image/jpeg", ".css": "text/css", ".js": "application/javascript" };
        res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end("Not Found");
      }
    }).listen(8899);
  },
};

const command = process.argv[2];
if (commands[command]) {
  commands[command]().catch(console.error);
} else {
  console.log(`
🎵 ncm-gallery - 网易云音乐个人歌单画廊生成器

用法:
  node index.js login     登录网易云音乐账号
  node index.js build     构建专属歌单画廊页面
  node index.js serve     本地预览已生成的页面

首次使用:
  1. node index.js login  (登录网易云音乐)
  2. node index.js build  (输入 DeepSeek API Key，等待生成)
  3. node index.js serve  (预览页面)
`);
}

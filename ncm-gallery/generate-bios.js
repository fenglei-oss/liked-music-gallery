const https = require("https");

const DEEPSEEK_BASE = "https://api.deepseek.com/v1";
const BATCH_SIZE = 15;

function deepseekChat(apiKey, messages, model = "deepseek-chat") {
  return new Promise((resolve) => {
    const body = JSON.stringify({ model, messages, stream: false, temperature: 0.7 });
    const url = new URL(`${DEEPSEEK_BASE}/chat/completions`);
    const req = https.request(
      {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: 120000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.choices?.[0]?.message?.content || "");
          } catch {
            resolve("");
          }
        });
      }
    );
    req.on("error", () => resolve(""));
    req.on("timeout", () => {
      req.destroy();
      resolve("");
    });
    req.write(body);
    req.end();
  });
}

/**
 * Generate artist bios and song notes using DeepSeek API
 */
async function generateBios(tracks, apiKey) {
  // Collect unique artists
  const artists = [...new Set(tracks.flatMap((t) => t.artists))].filter(Boolean);
  console.log(`   发现 ${artists.length} 位艺人`);

  // Generate artist bios in batches
  const artistBios = {};
  for (let i = 0; i < artists.length; i += BATCH_SIZE) {
    const batch = artists.slice(i, i + BATCH_SIZE);
    console.log(`   生成艺人介绍 ${i + 1}-${Math.min(i + BATCH_SIZE, artists.length)}/${artists.length}...`);
    const prompt = `你是华语音乐百科助手。请为以下每位艺人写一句话简介（15-30字），说明国籍、风格和特点。用JSON格式返回，key为艺人名，value为简介。

艺人名单：${JSON.stringify(batch)}

返回格式：{"艺人名": "简介", ...}

注意：只返回JSON，不要其他内容。`;
    const response = await deepseekChat(apiKey, [
      { role: "system", content: "你是音乐百科助手，用简洁的中文提供准确的艺人简介。" },
      { role: "user", content: prompt },
    ]);
    try {
      const parsed = parseJsonBlock(response);
      Object.assign(artistBios, parsed);
    } catch (e) {
      console.log(`   ⚠️  批次解析失败，重试...`);
      await sleep(2000);
    }
    await sleep(500);
  }

  // Generate song notes for well-known songs (top 40% by artist popularity - approximate by number of songs per artist)
  const artistSongCount = {};
  for (const t of tracks) {
    for (const a of t.artists) {
      artistSongCount[a] = (artistSongCount[a] || 0) + 1;
    }
  }
  const topArtists = [...Object.entries(artistSongCount)]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([name]) => name);

  const notableTracks = tracks.filter((t) => t.artists.some((a) => topArtists.includes(a)));

  console.log(`   生成歌曲介绍 (${notableTracks.length} 首重点曲目)...`);

  const songNotes = {};
  for (let i = 0; i < notableTracks.length; i += BATCH_SIZE) {
    const batch = notableTracks.slice(i, i + BATCH_SIZE);
    console.log(`   歌曲 ${i + 1}-${Math.min(i + BATCH_SIZE, notableTracks.length)}/${notableTracks.length}...`);
    const songsInfo = batch.map(
      (t) => `${t.id}: 《${t.title}》- ${t.artistText}`
    );
    const prompt = `你是华语音乐百科助手。请为以下歌曲各写一句话介绍（20-40字），说明其特点、背景或意义。对于不知名的歌曲可返回空字符串。用JSON格式返回，key为歌曲ID（数字），value为介绍。

歌曲列表：${JSON.stringify(songsInfo)}

返回格式：{"歌曲ID": "介绍", ...}
注意：只返回JSON，不要其他内容。对于不了解的歌曲请填写空字符串""。`;
    const response = await deepseekChat(apiKey, [
      { role: "system", content: "你是音乐百科助手，用简洁的中文提供准确的歌曲介绍。不了解的歌曲可跳过。" },
      { role: "user", content: prompt },
    ]);
    try {
      const parsed = parseJsonBlock(response);
      for (const [id, note] of Object.entries(parsed)) {
        if (note && note.trim() && note.trim() !== "暂无") {
          songNotes[id] = note;
        }
      }
    } catch (e) {
      console.log(`   ⚠️  批次解析失败`);
      await sleep(2000);
    }
    await sleep(500);
  }

  console.log(`   艺人生成: ${Object.keys(artistBios).length} 条，歌曲: ${Object.keys(songNotes).length} 条`);
  return { artistBios, songNotes };
}

function parseJsonBlock(text) {
  // Try direct JSON parse first
  try {
    return JSON.parse(text);
  } catch {}

  // Try extract from markdown code block
  const codeMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (codeMatch) {
    try {
      return JSON.parse(codeMatch[1]);
    } catch {}
  }

  // Try extract between { and the last }
  const jsonMatch = text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {}
  }

  throw new Error("Cannot parse JSON from response");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { generateBios };

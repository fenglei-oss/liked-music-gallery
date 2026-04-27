const { execSync } = require("child_process");
const path = require("path");
const https = require("https");
const fs = require("fs");

/**
 * Find the user's liked songs playlist ID
 */
async function fetchLikedSongs() {
  const result = execSync("ncm playlist list --json", { encoding: "utf8", timeout: 15000 });
  const data = JSON.parse(result);
  const playlists = data?.playlist || [];

  // Find the liked songs playlist (specialType === 5)
  const liked = playlists.find((p) => p.specialType === 5);
  if (!liked) {
    // Fallback: find playlist with "喜欢" in name
    const alt = playlists.find((p) => p.name && p.name.includes("喜欢"));
    if (alt) return String(alt.id);
    throw new Error("未找到喜欢歌单，请确认账号中已添加歌曲到「我喜欢的音乐」");
  }

  return String(liked.id);
}

/**
 * Fetch detailed song info from liked playlist
 */
async function fetchSongDetails(likedId) {
  const limit = 500;
  const result = execSync(`ncm playlist show ${likedId} --limit ${limit} --json`, {
    encoding: "utf8",
    timeout: 30000,
    maxBuffer: 50 * 1024 * 1024,
  });

  const playlist = JSON.parse(result);
  const rawTracks = playlist?.playlist?.tracks || [];

  const tracks = rawTracks.map((track, index) => {
    const art = track.ar || [];
    return {
      index: index + 1,
      id: track.id,
      title: track.name,
      artists: art.map((a) => a.name),
      artistText: art.map((a) => a.name).join(" / "),
      album: track.al?.name || "",
      albumId: track.al?.id,
      albumPicUrl: track.al?.picUrl || "",
      duration: formatDuration(track.dt || 0),
      cover: "",
    };
  });

  return tracks;
}

/**
 * Download album covers
 */
async function downloadCovers(tracks, coverDir) {
  const downloaded = new Set();
  let count = 0;

  for (const track of tracks) {
    const key = track.albumId || track.id;
    if (!key || downloaded.has(key)) continue;

    const coverFile = path.join(coverDir, `${key}.jpg`);
    if (fs.existsSync(coverFile)) {
      track.cover = `covers/${key}.jpg`;
      downloaded.add(key);
      continue;
    }

    const url = track.albumPicUrl + "?param=300y300";
    if (!url || !url.startsWith("http")) continue;

    try {
      await downloadFile(url, coverFile);
      track.cover = `covers/${key}.jpg`;
      downloaded.add(key);
      count++;
      if (count % 20 === 0) process.stdout.write(`   ${count}/${tracks.length}\r`);
    } catch {
      track.cover = "";
    }
  }
  console.log(`   ${count} 张封面已下载`);
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          https.get(res.headers.location, (r) => pipeResponse(r, dest, resolve, reject)).on("error", reject);
          return;
        }
        pipeResponse(res, dest, resolve, reject);
      })
      .on("error", reject);
  });
}

function pipeResponse(res, dest, resolve, reject) {
  const file = fs.createWriteStream(dest);
  res.pipe(file);
  file.on("finish", () => {
    file.close();
    resolve();
  });
  file.on("error", reject);
}

function formatDuration(ms) {
  const seconds = Math.round((ms || 0) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

module.exports = { fetchLikedSongs, fetchSongDetails, downloadCovers };

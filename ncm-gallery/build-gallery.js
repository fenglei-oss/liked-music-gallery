const fs = require("fs");
const path = require("path");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function buildGallery({ tracks, artistBios, songNotes, nickname, coverDir, outputDir }) {
  // Enrich tracks with bios
  const enriched = tracks.map((track) => {
    const artistBio = track.artists.map((a) => artistBios[a] || "").filter(Boolean)[0] || "";
    const songNote = songNotes[track.id] || "";
    return { ...track, artistBio, songNote };
  });

  // Hero covers (up to 42)
  const heroCovers = enriched.filter((t) => t.cover).slice(0, 42);

  // Top artists for filter chips
  const artistCounts = new Map();
  for (const track of enriched) {
    for (const artist of track.artists) {
      artistCounts.set(artist, (artistCounts.get(artist) || 0) + 1);
    }
  }
  const topArtists = [...artistCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(a[0]))
    .slice(0, 20);

  const uniqueAlbums = new Set(enriched.map((t) => `${t.album}::${t.artists[0] || ""}`));
  const uniqueArtists = new Set(enriched.flatMap((t) => t.artists));

  const trackJson = JSON.stringify(enriched).replace(/</g, "\\u003c");

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(nickname)}喜欢的音乐</title>
<style>
:root {
  color-scheme: light;
  --ink: #24302f;
  --muted: #667572;
  --line: rgba(41, 57, 55, .13);
  --paper: #f8f5ed;
  --paper-2: #fffdf7;
  --sage: #86a99c;
  --moss: #49685e;
  --coral: #d9785f;
  --sky: #c9dfe6;
  --butter: #f0d98d;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Hiragino Sans GB", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
  color: var(--ink);
  background:
    linear-gradient(90deg, rgba(255,255,255,.42) 1px, transparent 1px) 0 0 / 36px 36px,
    linear-gradient(180deg, #f6f0df 0%, #f8f5ed 38%, #edf4f0 100%);
  overflow-x: hidden;
}
button, input { font: inherit; }
.page { max-width: 1240px; margin: 0 auto; padding: 28px 22px 70px; }
.hero {
  min-height: 620px;
  display: grid;
  grid-template-columns: minmax(0, .92fr) minmax(360px, 1.08fr);
  gap: 34px;
  align-items: center;
  position: relative;
}
.hero::after {
  content: "";
  position: absolute;
  inset: -60px -22px -20px;
  background:
    radial-gradient(ellipse 80% 60% at 75% 50%, rgba(240,217,141,.18) 0%, transparent 60%),
    radial-gradient(ellipse 60% 70% at 25% 40%, rgba(201,223,230,.15) 0%, transparent 55%),
    radial-gradient(circle at 85% 30%, rgba(217,120,95,.08) 0%, transparent 45%);
  pointer-events: none;
  z-index: -1;
  border-radius: 48px;
}
.hero .deco-ring {
  position: absolute;
  right: 5%;
  top: 10%;
  width: clamp(180px, 22vw, 320px);
  aspect-ratio: 1;
  border: 2px dashed rgba(73,104,94,.12);
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
  animation: rotate 60s linear infinite;
}
.hero .deco-ring:nth-child(2) {
  right: 12%;
  top: 18%;
  width: clamp(120px, 16vw, 220px);
  border-color: rgba(217,120,95,.1);
  animation-duration: 80s;
  animation-direction: reverse;
}
@keyframes rotate { to { transform: rotate(360deg); } }
.hero-copy { padding: 28px 0; }
.eyebrow {
  width: fit-content;
  padding: 7px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255,255,255,.52);
  color: var(--moss);
  font-size: 13px;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.brand-title {
  position: relative;
  margin: 22px 0 18px;
  font-size: clamp(48px, 7vw, 88px);
  line-height: .96;
  letter-spacing: 0;
  max-width: 820px;
  overflow-wrap: anywhere;
}
.brand-title::before {
  content: "LIKED / ${enriched.length}";
  display: block;
  width: fit-content;
  margin-bottom: 12px;
  padding: 5px 10px;
  border-radius: 999px;
  background: #24302f;
  color: #fffdf7;
  font-size: 13px;
  line-height: 1;
  letter-spacing: .12em;
}
.brand-title span {
  display: block;
  width: fit-content;
  padding-right: .08em;
  text-shadow: 6px 6px 0 rgba(134, 169, 156, .22);
}
.brand-title span:last-child {
  position: relative;
  color: var(--moss);
}
.brand-title span:last-child::after {
  content: "";
  position: absolute;
  left: .02em;
  right: -.04em;
  bottom: .04em;
  height: .16em;
  border-radius: 999px;
  background: rgba(217, 120, 95, .42);
  z-index: -1;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  max-width: 620px;
  margin-top: 26px;
}
.stat {
  min-height: 86px;
  padding: 15px 16px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: rgba(255,255,255,.58);
}
.stat strong { display: block; font-size: 30px; line-height: 1; }
.stat span { display: block; margin-top: 8px; font-size: 13px; color: var(--muted); }
.cover-field {
  position: relative;
  min-height: 520px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  align-content: center;
  transform: rotate(-2deg);
}
.cover-field::before {
  content: "";
  position: absolute;
  inset: 7% 2% 10% 4%;
  border-radius: 42px;
  background: rgba(255,255,255,.5);
  filter: blur(2px);
  z-index: -1;
}
.cover-field img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 10px 22px rgba(44, 49, 47, .16);
}
.cover-field img:nth-child(5n) { transform: translateY(18px) rotate(3deg); }
.cover-field img:nth-child(7n) { transform: translateY(-16px) rotate(-3deg); }
.toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  gap: 16px;
  padding: 16px 0 20px;
  background: linear-gradient(180deg, rgba(248,245,237,.97), rgba(248,245,237,.84));
  backdrop-filter: blur(16px);
}
.controls {
  display: grid;
  grid-template-columns: minmax(230px, 1fr) auto;
  gap: 12px;
  align-items: center;
}
.search {
  width: 100%;
  height: 48px;
  padding: 0 18px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255,255,255,.72);
  color: var(--ink);
  outline: none;
}
.search:focus { border-color: rgba(73, 104, 94, .55); box-shadow: 0 0 0 4px rgba(134,169,156,.18); }
.view-toggle {
  display: flex;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255,255,255,.66);
}
.view-toggle button, .chips button {
  border: 0;
  color: var(--moss);
  background: transparent;
  cursor: pointer;
}
.view-toggle button {
  min-width: 78px;
  height: 38px;
  border-radius: 999px;
}
.view-toggle button.active { background: var(--moss); color: white; }
.chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 3px;
}
.chips button {
  flex: 0 0 auto;
  min-height: 36px;
  padding: 0 13px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255,255,255,.6);
  white-space: nowrap;
}
.chips button.active { background: #24302f; color: #fffdf7; border-color: #24302f; }
.section-title {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: end;
  margin: 16px 0 18px;
}
.section-title h2 { margin: 0; font-size: 28px; }
.section-title p { margin: 0; color: var(--muted); }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.track {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: rgba(255,253,247,.74);
  box-shadow: 0 8px 24px rgba(59, 68, 63, .08);
  overflow: hidden;
}
.track-cover {
  position: relative;
  aspect-ratio: 1.12;
  background: linear-gradient(135deg, var(--sky), var(--butter));
}
.track-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.track-cover::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 45%, rgba(0,0,0,.36));
}
.track-index {
  position: absolute;
  right: 12px;
  bottom: 10px;
  z-index: 1;
  color: #fffdf7;
  font-size: 13px;
}
.track-body { padding: 16px 16px 18px; flex: 1; display: flex; flex-direction: column; }
.track h3 { margin: 0; font-size: 22px; line-height: 1.18; overflow-wrap: anywhere; }
.meta { margin: 9px 0 0; color: var(--muted); line-height: 1.45; }
.artist-bio { margin: 12px 0 0; line-height: 1.65; color: var(--moss); font-size: 13px; }
.song-note { margin: 8px 0 0; padding: 10px 12px; line-height: 1.6; color: #40514d; font-size: 13px; background: rgba(134,169,156,.1); border-radius: 12px; border-left: 3px solid var(--sage); }
.play-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 12px 0 10px;
  border: 1px solid rgba(255, 253, 247, .72);
  border-radius: 999px;
  background: rgba(255, 253, 247, .86);
  color: #24302f;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(20, 26, 24, .18);
  backdrop-filter: blur(12px);
  transition: transform .16s ease, background .16s ease, color .16s ease;
}
.track-cover .play-link {
  position: absolute;
  left: 12px;
  bottom: 10px;
  z-index: 2;
}
.play-link::before { content: "▶"; font-size: 11px; line-height: 1; }
.play-link:hover { transform: translateY(-1px); background: var(--moss); color: #fffdf7; }
.play-link:focus-visible { outline: 3px solid rgba(217, 120, 95, .34); outline-offset: 3px; }
.list .grid { display: flex; flex-direction: column; gap: 9px; }
.list .track {
  display: grid;
  grid-template-columns: 74px 1fr auto;
  align-items: center;
  border-radius: 18px;
  box-shadow: none;
}
.list .track-cover { width: 74px; height: 74px; aspect-ratio: auto; }
.list .track-cover::after { display: none; }
.list .track-index { position: static; padding: 0 18px 0 8px; color: var(--sage); }
.list .track-body { padding: 10px 14px; }
.list .track h3 { font-size: 18px; }
.list .artist-bio { display: none; }
.list .song-note { display: none; }
.list .play-link { left: 7px; bottom: 7px; min-height: 26px; padding: 0 9px 0 8px; font-size: 0; gap: 0; }
.list .play-link::before { font-size: 10px; }
.empty {
  display: none;
  padding: 54px 20px;
  text-align: center;
  border: 1px dashed var(--line);
  border-radius: 24px;
  color: var(--muted);
}
.no-results .empty { display: block; }
.no-results .grid { display: none; }
@media (max-width: 860px) {
  .page { padding: 18px 14px 44px; }
  .hero { grid-template-columns: 1fr; min-height: auto; gap: 16px; }
  .hero-copy { min-width: 0; width: min(100%, 340px); max-width: 100%; overflow: hidden; }
  .brand-title { max-width: 340px; font-size: 38px; line-height: 1.08; }
  .brand-title span { display: block; }
  .cover-field { min-height: auto; grid-template-columns: repeat(6, 1fr); order: -1; }
  .cover-field img:nth-child(n+25) { display: none; }
  .stats { grid-template-columns: 1fr; }
  .controls { grid-template-columns: 1fr; }
  .view-toggle { width: fit-content; }
  .grid { grid-template-columns: 1fr; }
  .toolbar { margin-left: -14px; margin-right: -14px; padding-left: 14px; padding-right: 14px; }
}
</style>
</head>
<body>
<main class="page">
  <section class="hero">
    <div class="deco-ring" aria-hidden="true"></div>
    <div class="deco-ring" aria-hidden="true"></div>
    <div class="hero-copy">
      <div class="eyebrow">NetEase Cloud Collection</div>
      <h1 class="brand-title"><span>${escapeHtml(nickname)}</span><span>喜欢的音乐</span></h1>
      <div class="stats">
        <div class="stat"><strong>${enriched.length}</strong><span>首歌曲</span></div>
        <div class="stat"><strong>${uniqueArtists.size}</strong><span>位艺人</span></div>
        <div class="stat"><strong>${uniqueAlbums.size}</strong><span>张专辑/单曲</span></div>
      </div>
    </div>
    <div class="cover-field" aria-hidden="true">
      ${heroCovers.map((t) => `<img src="${escapeHtml(t.cover)}" alt="">`).join("")}
    </div>
  </section>

  <section class="toolbar" aria-label="筛选工具">
    <div class="controls">
      <input class="search" id="search" type="search" placeholder="搜索歌曲、艺人或专辑">
      <div class="view-toggle" aria-label="视图切换">
        <button class="active" data-view="cards" type="button">卡片</button>
        <button data-view="list" type="button">列表</button>
      </div>
    </div>
    <div class="chips" id="chips">
      <button class="active" data-artist="" type="button">全部</button>
      ${topArtists.map(([artist, count]) => `<button data-artist="${escapeHtml(artist)}" type="button">${escapeHtml(artist)} · ${count}</button>`).join("")}
    </div>
  </section>

  <section id="library">
    <div class="section-title">
      <h2>曲目清单</h2>
      <p id="result-count">${enriched.length} 首</p>
    </div>
    <div class="grid" id="grid"></div>
    <div class="empty">没有匹配到曲目，换个关键词试试。</div>
  </section>
</main>

<script>
const tracks = ${trackJson};
const PAGE_SIZE = 10;
let currentArtist = "";
let currentQuery = "";
let currentView = "cards";
let filteredTracks = [];
let displayedCount = 0;
let sentinel = null;
let observer = null;
const grid = document.querySelector("#grid");
const library = document.querySelector("#library");
const resultCount = document.querySelector("#result-count");
const search = document.querySelector("#search");
const chips = document.querySelector("#chips");

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));

const coverMarkup = (track) => track.cover
  ? '<img loading="lazy" src="' + escapeHtml(track.cover) + '" alt="' + escapeHtml(track.album) + '">'
  : "";

const trackMarkup = (track) => \`
  <article class="track">
    <div class="track-cover">
      \${coverMarkup(track)}
      <a class="play-link" href="https://music.163.com/#/song?id=\${track.id}" target="_blank" rel="noopener noreferrer" aria-label="播放 \${escapeHtml(track.title)}">播放</a>
      <span class="track-index">\${String(track.index).padStart(3, "0")}</span>
    </div>
    <div class="track-body">
      <h3>\${escapeHtml(track.title)}</h3>
      <p class="meta">\${escapeHtml(track.artistText)} · \${escapeHtml(track.album)} · \${escapeHtml(track.duration)}</p>
      \${track.artistBio ? '<p class="artist-bio">' + escapeHtml(track.artistBio) + '</p>' : ''}
      \${track.songNote ? '<p class="song-note">' + escapeHtml(track.songNote) + '</p>' : ''}
    </div>
  </article>\`;

function removeSentinel() {
  if (sentinel) { sentinel.remove(); sentinel = null; }
  if (observer) { observer.disconnect(); observer = null; }
}

function addSentinel() {
  removeSentinel();
  if (displayedCount >= filteredTracks.length) return;
  sentinel = document.createElement("div");
  sentinel.className = "sentinel";
  sentinel.style.cssText = "height:1px;grid-column:1/-1";
  grid.appendChild(sentinel);
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore();
  }, { rootMargin: "300px" });
  observer.observe(sentinel);
}

function loadMore() {
  if (currentView === "list") return;
  const next = Math.min(displayedCount + PAGE_SIZE, filteredTracks.length);
  if (next <= displayedCount) { removeSentinel(); return; }
  const html = filteredTracks.slice(displayedCount, next).map(trackMarkup).join("");
  removeSentinel();
  grid.insertAdjacentHTML("beforeend", html);
  displayedCount = next;
  addSentinel();
}

function render(reset) {
  if (reset) removeSentinel();
  const query = currentQuery.trim().toLowerCase();
  filteredTracks = tracks.filter((track) => {
    const haystack = [track.title, track.artistText, track.album, track.artistBio, track.songNote].join(" ").toLowerCase();
    return (!currentArtist || track.artists.includes(currentArtist)) && (!query || haystack.includes(query));
  });
  if (currentView === "list") {
    displayedCount = filteredTracks.length;
    grid.innerHTML = filteredTracks.map(trackMarkup).join("");
  } else {
    displayedCount = Math.min(PAGE_SIZE, filteredTracks.length);
    grid.innerHTML = filteredTracks.slice(0, displayedCount).map(trackMarkup).join("");
    addSentinel();
  }
  resultCount.textContent = filteredTracks.length + " 首";
  library.classList.toggle("no-results", filteredTracks.length === 0);
  document.body.classList.toggle("list", currentView === "list");
}

search.addEventListener("input", (event) => {
  currentQuery = event.target.value;
  render(true);
});

chips.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  currentArtist = button.dataset.artist || "";
  chips.querySelectorAll("button").forEach((chip) => chip.classList.toggle("active", chip === button));
  render(true);
});

document.querySelector(".view-toggle").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  currentView = button.dataset.view;
  document.querySelectorAll(".view-toggle button").forEach((item) => item.classList.toggle("active", item === button));
  render(true);
});

render();
</script>
</body>
</html>`;

  const outPath = path.join(outputDir, "gallery.html");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outPath, html);
  return outPath;
}

module.exports = { buildGallery };

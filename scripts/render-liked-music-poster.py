import json
import math
import os
import textwrap
import urllib.parse
import urllib.request
from io import BytesIO

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = "/Users/lane/Documents/New project"
RAW_PATH = os.path.join(ROOT, "output", "liked-music-raw.json")
DETAIL_PATH = os.path.join(ROOT, "output", "liked-music-detail.json")
COVER_DIR = os.path.join(ROOT, "output", "liked_music_covers")
PNG_PATH = os.path.join(ROOT, "output", "liked-music-long-poster.png")
HTML_PATH = os.path.join(ROOT, "output", "liked-music-long-poster.html")

FONT_CJK = "/System/Library/Fonts/Hiragino Sans GB.ttc"
FONT_LATIN = "/System/Library/Fonts/Helvetica.ttc"


BIO = {
    "Motorama": "俄罗斯后朋克乐队，用冷冽贝斯线和朦胧旋律写出东欧式浪漫。",
    "Slowdive": "英国盯鞋经典乐队，以漂浮音墙和柔软人声定义梦幻噪音美学。",
    "大象体操": "台湾数学摇滚乐团，擅长把灵巧节拍和清澈旋律编成细密结构。",
    "Suede": "英国 Britpop 代表乐队，华丽、颓美又带着戏剧化的摇滚锋芒。",
    "陈粒": "中国独立唱作人，以诗性歌词和松弛声线构建私人化叙事。",
    "Aisha Badru": "美国民谣创作者，声音温柔克制，作品带着自然与自省气息。",
    "東京酒吐座": "日本盯鞋乐队，以厚重失真和迷幻旋律制造强烈音墙。",
    "岡村孝子": "日本流行女歌手，清亮声线里有昭和到平成的温柔抒情感。",
    "Pinback": "美国独立摇滚乐队，以精巧贝斯和冷静旋律营造内敛张力。",
    "黄绮珊": "中国实力派女歌手，以宽广声场和强情绪表达见长。",
    "希林娜依高": "中国流行歌手，声线明亮有力量，兼具舞台感染力与细腻度。",
    "Yakui The Maid": "电子与氛围创作者，常以游戏感、碎拍和梦境质地组织声音。",
    "the neverminds": "独立摇滚/盯鞋气质乐队，声音明亮而带有轻微噪音边缘。",
    "COALTAR OF THE DEEPERS": "日本另类摇滚名团，将盯鞋、金属和电子感混合成高密度声响。",
    "she’s green": "日本新生代独立/盯鞋团体，旋律清澈，声音像薄雾里的吉他光晕。",
    "Huge Gap": "独立 emo/另类摇滚取向乐队，作品带着青春期的锋利与松弛。",
    "ゲシュタルト乙女": "台湾成员组成的日语独立乐队，节奏轻盈，旋律有都市感。",
    "THE MUSMUS": "日本另类摇滚乐队，旋律直接，现场感强烈。",
    "王菲": "华语流行标志性歌手，空灵声线与先锋审美影响深远。",
    "mudy on the 昨晩": "日本数学摇滚乐队，以复杂节拍和锐利吉他线条推进情绪。",
    "ヒメウズ（himeuzu）": "日本独立音乐人/团体，作品偏梦幻、细腻且带私人气息。",
    "琥珀": "西安后摇乐队，用长线条旋律和层叠吉他描摹辽阔情绪。",
    "椎名林檎": "日本创作女歌手，将摇滚、爵士和歌舞伎式戏剧感融为一体。",
    "Fayzz": "中国器乐/后摇乐队，以明亮旋律和宽广动态铺陈情绪。",
    "天然味道": "独立音乐计划，作品带有日系旋律和轻盈青春感。",
    "Tears for Fears": "英国新浪潮/流行摇滚组合，以大旋律和心理主题著称。",
    "Wednesday": "美国独立摇滚乐队，把乡村碎片、噪音吉他和情绪摇滚揉在一起。",
    "Selena Quintanilla": "Tejano 流行传奇歌手，明亮声线连接拉丁流行与主流听众。",
    "Megumi Acorda": "菲律宾梦幻流行/盯鞋音乐人，声音温柔而带有朦胧颗粒感。",
    "ZARD": "日本流行摇滚代表，坂井泉水的清澈声线承载了时代记忆。",
    "Wisp": "美国新生代盯鞋音乐人，以柔软人声和厚重吉他雾气走红。",
    "文雀": "中国后摇乐队，用器乐叙事和层层递进的动态制造电影感。",
    "honeydip": "日本盯鞋/独立乐队，旋律甜美，吉他音色带九十年代质感。",
    "world's end girlfriend": "日本实验音乐人，把古典、电子和后摇拼贴成宏大叙事。",
    "惘闻": "大连后摇代表乐队，以克制铺陈和史诗动态记录时间感。",
    "Porcupine Tree": "英国前卫摇滚乐队，兼具复杂结构、金属质感与旋律表达。",
    "God Is An Astronaut": "爱尔兰后摇乐队，以恢宏音墙和太空感旋律见长。",
    "Athletics": "美国情绪后摇/后硬核乐队，作品真挚、爆发且充满拉扯感。",
    "LITE": "日本数学摇滚代表，演奏精准，律动复杂却保持流畅。",
    "迷失克莱因": "中国独立/器乐乐队，以氛围铺陈和细腻吉他纹理见长。",
    "Wolf Alice": "英国另类摇滚乐队，在噪音、梦幻流行和独立摇滚之间自由切换。",
    "ひとひら": "日本 emo/独立摇滚乐队，声音直接而带有青涩的爆发力。",
    "海德薇乐队(THE HEDWIG)": "中国独立摇滚乐队，旋律明亮，带有青春与都市感。",
    "ラブリーサマーちゃん": "日本独立流行创作者，声音轻盈，旋律有夏日胶片感。",
    "陈绮贞": "台湾民谣/独立流行代表，以清澈声线和细腻文字陪伴一代听众。",
    "LOVE PSYCHEDELICO": "日本摇滚组合，把英伦摇滚、民谣和复古律动混成独特口音。",
    "U137": "瑞典后摇/氛围音乐计划，以辽阔、明亮的旋律线著称。",
    "气象限定Quadrant": "中国独立乐队，声音像气象变化一样在清澈与噪音间流动。",
    "Yuck": "英国独立摇滚乐队，延续九十年代吉他噪音与懒散旋律传统。",
    "toe": "日本数学摇滚代表乐队，以细密鼓点和温柔吉他线条著称。",
    "The Cure": "英国后朋克/哥特摇滚传奇，黑色浪漫与流行旋律同样动人。",
    "きのこ帝国": "日本独立/盯鞋乐队，擅长把青春疼痛写进雾状吉他音墙。",
    "세이수미": "韩国冲浪/独立摇滚乐队，旋律清爽，带有海风般的怀旧感。",
}


def ensure_dirs():
    os.makedirs(COVER_DIR, exist_ok=True)


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_details(tracks):
    if os.path.exists(DETAIL_PATH):
        with open(DETAIL_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    ids = [t["id"] for t in tracks]
    songs = []
    for i in range(0, len(ids), 80):
        chunk = ids[i : i + 80]
        encoded = urllib.parse.quote(json.dumps(chunk, separators=(",", ":")))
        data = fetch_json(f"https://music.163.com/api/song/detail/?ids={encoded}")
        songs.extend(data.get("songs", []))

    by_id = {song["id"]: song for song in songs}
    with open(DETAIL_PATH, "w", encoding="utf-8") as f:
        json.dump(by_id, f, ensure_ascii=False, indent=2)
    return by_id


def get_font(size, fallback=False):
    path = FONT_LATIN if fallback else FONT_CJK
    return ImageFont.truetype(path, size)


def fit_text(draw, text, font, max_width):
    text = str(text or "")
    if draw.textlength(text, font=font) <= max_width:
        return text
    ellipsis = "…"
    lo, hi = 0, len(text)
    while lo < hi:
        mid = (lo + hi) // 2
        candidate = text[:mid] + ellipsis
        if draw.textlength(candidate, font=font) <= max_width:
            lo = mid + 1
        else:
            hi = mid
    return text[: max(0, lo - 1)] + ellipsis


def wrap_text(draw, text, font, max_width, max_lines=2):
    text = str(text or "")
    lines = []
    current = ""
    for char in text:
        candidate = current + char
        if draw.textlength(candidate, font=font) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = char
            if len(lines) >= max_lines:
                break
    if current and len(lines) < max_lines:
        lines.append(current)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
    if len(lines) == max_lines and draw.textlength(lines[-1], font=font) > max_width:
        lines[-1] = fit_text(draw, lines[-1], font, max_width)
    return lines


def artist_bio(artists):
    names = [a.get("name", "") for a in artists if a.get("name")]
    for name in names:
        if name in BIO:
            return BIO[name]
    joined = " / ".join(names) or "这位音乐人"
    if any(ord(c) > 127 for c in joined):
        return f"{joined} 的作品在这份歌单里承担着旋律、氛围与私人情绪的连接点。"
    return f"{joined} brings a distinct indie texture here, balancing melody, atmosphere, and emotional detail."


def avg_color(img):
    sample = img.resize((1, 1), Image.Resampling.LANCZOS).convert("RGB")
    return sample.getpixel((0, 0))


def cover_for(song, row_index):
    album = song.get("album") or {}
    url = album.get("picUrl") or album.get("blurPicUrl")
    cache_key = str(album.get("id") or song.get("id"))
    path = os.path.join(COVER_DIR, f"{cache_key}.jpg")
    if url and not os.path.exists(path):
        try:
            req = urllib.request.Request(url + "?param=220y220", headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = resp.read()
            img = Image.open(BytesIO(data)).convert("RGB")
            img.thumbnail((220, 220), Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", (220, 220), avg_color(img))
            canvas.paste(img, ((220 - img.width) // 2, (220 - img.height) // 2))
            canvas.save(path, quality=88)
        except Exception:
            pass
    if os.path.exists(path):
        return Image.open(path).convert("RGB")

    hue = (row_index * 37) % 360
    base = Image.new("RGB", (220, 220), (28 + hue % 60, 32 + hue % 42, 48 + hue % 80))
    d = ImageDraw.Draw(base)
    for r in range(0, 220, 18):
        d.arc((r - 80, r - 80, 300 - r, 300 - r), 20, 250, fill=(90, 120, 150), width=2)
    return base


def rounded_paste(bg, img, box, radius=18):
    x, y, w, h = box
    img = img.resize((w, h), Image.Resampling.LANCZOS)
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    bg.paste(img, (x, y), mask)


def draw_gradient(draw, width, height):
    for y in range(height):
        t = y / max(1, height - 1)
        r = int(13 + 14 * t)
        g = int(18 + 9 * t)
        b = int(25 + 18 * t)
        draw.line((0, y, width, y), fill=(r, g, b))


def render():
    ensure_dirs()
    with open(RAW_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    tracks = raw["playlist"]["tracks"]
    details = fetch_details(tracks)

    width = 1600
    margin = 72
    header_h = 520
    row_h = 122
    footer_h = 120
    height = header_h + row_h * len(tracks) + footer_h

    img = Image.new("RGB", (width, height), (14, 18, 26))
    draw = ImageDraw.Draw(img)
    draw_gradient(draw, width, height)

    title_font = get_font(64)
    sub_font = get_font(28)
    small_font = get_font(22)
    song_font = get_font(31)
    meta_font = get_font(21)
    bio_font = get_font(19)
    index_font = get_font(18)

    # Header cover ribbon.
    x = margin
    y = 56
    for i, track in enumerate(tracks[:18]):
        song = details.get(str(track["id"])) or details.get(track["id"]) or track
        cov = cover_for(song, i).resize((92, 92), Image.Resampling.LANCZOS)
        rounded_paste(img, cov, (x + (i % 9) * 104, y + (i // 9) * 104, 92, 92), 14)

    overlay = Image.new("RGBA", (width, header_h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle((0, 0, width, header_h), fill=(9, 12, 18, 120))
    img.paste(Image.alpha_composite(img.crop((0, 0, width, header_h)).convert("RGBA"), overlay).convert("RGB"), (0, 0))
    draw = ImageDraw.Draw(img)

    draw.text((margin, 255), "咖啡控雷恩喜欢的音乐", font=title_font, fill=(245, 241, 232))
    draw.text((margin, 338), "189 SONGS · ALBUM-COVER LONG POSTER", font=sub_font, fill=(195, 219, 214))
    draw.text((margin, 386), "歌曲 / 艺人 / 专辑 / 艺人一句话简介", font=small_font, fill=(156, 166, 178))
    draw.rounded_rectangle((margin, 450, width - margin, 452), radius=1, fill=(93, 151, 142))

    content_x = margin
    cover_size = 86
    text_x = content_x + cover_size + 30
    max_song_w = width - text_x - margin - 170
    max_bio_w = width - text_x - margin

    for i, track in enumerate(tracks):
        song = details.get(str(track["id"])) or details.get(track["id"]) or track
        y = header_h + i * row_h
        card = (24, 31, 42) if i % 2 == 0 else (18, 25, 35)
        draw.rounded_rectangle((42, y + 10, width - 42, y + row_h - 10), radius=18, fill=card)

        cov = cover_for(song, i)
        rounded_paste(img, cov, (content_x, y + 18, cover_size, cover_size), 16)

        artists = song.get("artists") or song.get("ar") or []
        album = song.get("album") or song.get("al") or {}
        artist_names = " / ".join(a.get("name", "") for a in artists if a.get("name"))
        album_name = album.get("name", "")
        duration_ms = song.get("duration") or song.get("dt") or 0
        duration = f"{math.floor(duration_ms / 60000)}:{int((duration_ms / 1000) % 60):02d}"

        draw.text((text_x, y + 18), fit_text(draw, song.get("name", ""), song_font, max_song_w), font=song_font, fill=(244, 240, 231))
        meta = f"{artist_names} · {album_name} · {duration}"
        draw.text((text_x, y + 58), fit_text(draw, meta, meta_font, max_song_w + 140), font=meta_font, fill=(163, 178, 184))
        bio = artist_bio(artists)
        draw.text((text_x, y + 88), fit_text(draw, bio, bio_font, max_bio_w), font=bio_font, fill=(197, 198, 185))

        draw.text((width - margin - 78, y + 23), f"{i + 1:03d}", font=index_font, fill=(92, 151, 142))

    fy = header_h + row_h * len(tracks) + 34
    draw.text((margin, fy), "Generated from NetEase Cloud playlist data. Covers use album artwork where available.", font=small_font, fill=(143, 153, 163))
    draw.text((margin, fy + 38), "Design render: Codex · 2026", font=small_font, fill=(93, 151, 142))

    img.save(PNG_PATH, optimize=True)

    html = f"""<!doctype html>
<meta charset="utf-8">
<title>咖啡控雷恩喜欢的音乐</title>
<style>body{{margin:0;background:#0e121a;display:grid;place-items:start center}}img{{max-width:100%;height:auto;display:block}}</style>
<img src="{os.path.basename(PNG_PATH)}" alt="咖啡控雷恩喜欢的音乐长图">
"""
    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html)

    print(json.dumps({"png": PNG_PATH, "html": HTML_PATH, "height": height, "tracks": len(tracks)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    render()

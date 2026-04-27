const fs = require("fs");
const path = require("path");

const ROOT = "/Users/lane/Documents/New project";
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, "output/liked-music-raw.json"), "utf8"));
const details = JSON.parse(fs.readFileSync(path.join(ROOT, "output/liked-music-detail.json"), "utf8"));
const coverDir = path.join(ROOT, "output/liked_music_covers");
const outPath = path.join(ROOT, "output/liked-music-gallery.html");

const bios = {
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
  "Yakui The Maid": "俄罗斯音乐人，maidcore代表之一，常以游戏感、碎拍和梦境质地组织电子与氛围声音。",
  "the neverminds": "多伦多盯鞋/梦幻流行乐队，自制作并受MBV、Whirr等影响，声音明亮而带有噪音边缘。",
  "COALTAR OF THE DEEPERS": "日本另类摇滚名团，将盯鞋、金属和电子感混合成高密度声响。",
  "she’s green": "美国明尼阿波利斯梦幻流行/盯鞋乐队，旋律清澈，声音像薄雾里的吉他光晕。",
  "Huge Gap": "北京独立音乐人/计划，在中西部emo与独立摇滚之间保持青春期的锋利与松弛。",
  "ゲシュタルト乙女": "台湾成员组成的日语独立乐队，融合数学摇滚的灵巧节拍与都市感的轻盈旋律。",
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
  "Wolf Alice": "英国另类摇滚乐队，在噪音、梦幻流行和独立摇滚之间自由切换。",
  "ひとひら": "东京 emo/独立摇滚乐队，声音直接而带有青涩的爆发力与中西部emo影响。",
  "陈绮贞": "台湾民谣/独立流行代表，以清澈声线和细腻文字陪伴一代听众。",
  "LOVE PSYCHEDELICO": "日本摇滚组合，把英伦摇滚、民谣和复古律动混成独特口音。",
  "U137": "瑞典后摇/氛围音乐计划，以辽阔、明亮的旋律线著称。",
  "Yuck": "英国独立摇滚乐队，延续九十年代吉他噪音与懒散旋律传统。",
  "toe": "日本数学摇滚代表乐队，以细密鼓点和温柔吉他线条著称。",
  "The Cure": "英国后朋克/哥特摇滚传奇，黑色浪漫与流行旋律同样动人。",
  "きのこ帝国": "日本独立/盯鞋乐队，擅长把青春疼痛写进雾状吉他音墙。",
  "세이수미": "韩国冲浪/独立摇滚乐队，旋律清爽，带有海风般的怀旧感。",
  "热斑Heat Mark": "广州独立乐队，音乐在梦幻流行、盯鞋和城市感旋律之间流动。",
  "徐怀钰": "台湾流行女歌手，九十年代末以明亮声线和高辨识度流行单曲走红。",
  "气象限定Quadrant": "北京数学摇滚乐队，以复杂节拍、清澈吉他线条和精密编曲见长。",
  "CQ": "日本盯鞋乐队，延续东京地下吉他噪音传统，旋律感柔软而迷离。",
  "Go with Strangers": "马来西亚独立摇滚乐队，作品带有复古吉他流行和明亮旋律气质。",
  "Heavenstamp": "日本另类摇滚乐队，把英伦吉他感、电子律动和女声旋律结合得很利落。",
  "té": "日本器乐摇滚乐队，以长标题、复杂律动和强烈动态推进著称。",
  "Temples": "英国迷幻摇滚乐队，擅长复古合成器色彩和六十年代感旋律。",
  "林忆莲": "华语流行天后，声音细腻克制，横跨都市情歌、R&B 和电子流行。",
  "水中スピカ": "京都数学摇滚乐队，女性主唱以点弦技法配合流行旋律，在器乐精度与亲和力之间游走。",
  "蛙池": "中国独立乐队，以南方生活感、民谣叙事和松弛律动塑造鲜明气质。",
  "Airiel": "美国盯鞋乐队，厚重吉他音墙和梦幻旋律保留了九十年代经典质地。",
  "Blume popo": "日本另类摇滚/盯鞋/梦幻流行乐队，2015年结成于滋贺县，旋律轻盈而吉他层次丰富。",
  "Carsick Cars": "北京独立摇滚代表乐队，以粗粝吉他、极简律动和地下现场能量著称。",
  "CATS NEVER DIE": "俄罗斯后摇/盯鞋乐队，器乐为主，声音以清透吉他音色和冷色调氛围展开。",
  "David Bowie": "英国摇滚与流行艺术传奇，持续以角色、声音和视觉概念推动音乐边界。",
  "Derya Yıldırım & Grup Şimşek": "德土音乐组合，把安纳托利亚民谣、迷幻摇滚和复古律动融合在一起。",
  "Forsaken Autumn": "上海盯鞋/梦幻流行乐队，白噪音之下游走着疏离、冷感与梦幻的内心景观。",
  "Friko": "芝加哥独立摇滚乐队，以戏剧化动态、清亮旋律和情绪爆发受到关注。",
  "G.E.M.邓紫棋": "华语流行唱作人，以强力唱腔、旋律写作和舞台表现力见长。",
  "GoGo Penguin": "英国爵士三重奏，用钢琴、贝斯和鼓构建带电子律动感的现代爵士。",
  "How to count one to ten": "东京器乐后摇乐队，以五成员精密分配音符制造明亮、自然的声景。",
  "I'm fine! Thank you! And you?": "中国盯鞋/独立摇滚乐队，作品以噪音墙、梦幻质感与层层推进的年轻情绪展开。",
  "Jo's Moving Day乔迁日": "中国独立乐队，音乐在另类摇滚、梦幻流行和年轻叙事之间游走。",
  "JPBS": "泰国曼谷器乐摇滚乐队，自2012年活跃于地下场景，吉他旋律松弛而富有日常感。",
  "kurayamisaka": "东京大井町五人编制摇滚乐队，以独立摇滚为根基，融合盯鞋与九十年代另类声响。",
  "Mogwai": "苏格兰后摇代表乐队，以巨大动态、长篇器乐结构和电影感音墙闻名。",
  "My Bloody Valentine": "爱尔兰/英国盯鞋传奇乐队，以颤音吉他和浓密音墙重塑吉他音乐想象。",
  "PHONO RECORDS": "独立音乐创作名义，声音常带有卧室流行和轻电子的私人质感。",
  "polly": "日本另类摇滚/盯鞋乐队，旋律冷感，吉他音色兼具透明度与噪音感。",
  "REDЯUM": "日本独立摇滚/神游舞曲乐队，1996年结成，以 Portishead 为灵感，融合女声旋律与幽暗律动。",
  "Sadness": "美国黑金属/后摇个人计划，常把极端音乐、氛围和脆弱旋律并置。",
  "Show Me A Dinosaur": "俄罗斯后摇/后金属乐队，声音融合氛围、盯鞋质感与强烈失真推进。",
  "Star Horse": "瑞典盯鞋乐队，延续北欧梦幻流行质地，吉他音墙柔软而明亮。",
  "Sweet Trip": "美国实验电子/梦幻流行组合，把 IDM 纹理、盯鞋和旋律流行混合得精巧。",
  "the brilliant green": "日本流行摇滚乐队，以英伦感吉他编曲和川濑智子的独特声线成名。",
  "The Radio Dept.": "瑞典独立流行乐队，把低保真、梦幻流行和政治感文本做得轻柔克制。",
  "The Rose Bites": "中国独立乐队，声音带有后朋克、另类摇滚和冷色调吉他质感。",
  "Two Wounded Birds": "英国独立乐队，作品带有冲浪摇滚、复古流行和清爽吉他旋律。",
  "unfoldingskies": "独立器乐/氛围创作计划，声音以铺陈式吉他和开放空间感为主。",
  "yocho": "中国独立音乐人/项目，作品以清爽律动和细腻吉他线条制造明亮、松弛的流行质感。",
  "Yuètù": "独立音乐人/项目，作品在轻盈旋律和柔和氛围之间保持私人化表达。",
  "动物园钉子户": "中国独立摇滚乐队，以幽默感、年轻语气和明亮吉他流行获得关注。",
  "及时撤退Jane’s Fallback": "中国独立乐队，音乐在 emo、独立摇滚和青春叙事之间保持真诚张力。",
  "周麟与少年宫遗事": "中国独立音乐计划，以复古流行、城市叙事和松弛编曲塑造怀旧质感。",
  "完美倒立": "中国独立乐队，作品带有梦幻吉他、青春感旋律和轻盈噪音边缘。",
  "张玮玮": "中国民谣音乐人，以手风琴、口语化叙事和西北气质写出现实感。",
  "椿乐队": "中国独立摇滚乐队，声音直接明亮，兼具吉他流行和现场冲击力。",
  "浅水ShallowEnd": "中国独立乐队，作品以清透吉他、柔和人声和梦幻流行气质见长。",
  "白色海岸The White Coast": "中国独立乐队，音乐带有海岸感的吉他旋律和清爽流行色彩。",
  "索廷": "中国独立音乐人，作品常以细腻旋律和内向文本构成私人化表达。",
  "缺省": "中国后朋克/独立摇滚乐队，冷峻律动和克制女声构成鲜明的城市感。",
  "表情银行MimikBanka": "中国独立流行乐队，声音轻巧，旋律和编曲带有明亮的复古趣味。",
  "诱导社": "北京朋克/另类摇滚乐队，中国地下摇滚重要名字之一，表达直接有力。",
  "赵登凯": "中国独立流行唱作人，创作以温柔旋律和私人化叙事见长，兼顾影视剧歌曲。",
  "软骨Gristle": "中国独立乐队，声音在另类摇滚、后朋克和冷感吉他质地之间展开。",
  "辛晓琪": "华语情歌代表女声，细腻声线和成熟情绪表达极具辨识度。",
  "逃走鮑伯": "台湾独立乐队，作品常带有青春感旋律、吉他流行和轻快现场气息。",
  "野岸刊": "中国独立乐队，音乐在噪音吉他、情绪摇滚和年轻叙事间展开。",
  "阿克江Akin": "中国 R&B/灵魂乐唱作人，作品兼具律动感、细腻旋律和松弛表达。",
  "陈珊妮": "台湾创作女歌手与制作人，以冷感声线、独立审美和精准制作著称。",
  "ラブリーサマーちゃん": "日本独立流行创作者，声音轻盈，旋律有夏日胶片感。",
  "海德薇乐队(THE HEDWIG)": "中国独立摇滚乐队，旋律明亮，带有青春与都市感。",
  "迷失克莱因": "中国独立/器乐乐队，以氛围铺陈和细腻吉他纹理见长。",
  "Black Country, New Road": "英国实验摇滚乐队，把室内乐、后摇和文学化叙事混成紧张的群像声音。",
  "My Little Lover": "日本流行组合，清澈女声和九十年代 J-pop 编曲构成温柔的时代质感。",
  "betcover!!": "日本另类创作计划，常在爵士、摇滚和戏剧化唱腔之间游走。",
  "山下達郎": "日本城市流行巨匠，以精密制作、和声美学和温暖旋律著称。",
  "Sonic Youth": "纽约噪音摇滚代表乐队，以非常规调弦和实验吉他语言影响深远。",
  "尹光": "香港粤语歌手，以市井叙事、谐趣表达和强烈地域风格闻名。",
  "Ulrich Schnauss": "德国电子音乐人，以梦幻合成器和细腻氛围塑造流动的电子声景。",
  "Jonas Munk": "丹麦吉他手与制作人，作品常在氛围摇滚、电子和迷幻纹理之间展开。",
  "Tizzy Bac": "台湾独立乐队，以钢琴摇滚、文学化歌词和鲜明女声形成独特辨识度。",
  "左小祖咒": "中国另类音乐人，以粗粝声线、观念表达和实验姿态著称。",
  "Serrini": "香港唱作人，作品兼具流行旋律、幽默感和鲜明的个人文本。",
  "许茹芸": "华语流行女歌手，气声唱法和柔软情绪表达极具辨识度。",
  "白安": "台湾唱作人，声音清亮，作品在民谣、流行与电子感之间保持灵动。",
  "Blur": "英国 Britpop 核心乐队，兼具英伦流行旋律、讽刺气质和不断变化的风格野心。",
  "露波合唱团": "台湾独立乐队，旋律柔软，文字带有日常里的轻盈和敏感。",
  "杨乃文": "台湾摇滚女声代表，冷冽声线和克制表达带来独特的都市气质。",
  "姜昕": "中国摇滚女歌手，声音粗粝真诚，作品带有九十年代摇滚的个人锋芒。",
  "レミオロメン": "日本摇滚乐队，以朴素旋律和带画面感的季节书写被广泛记住。",
  "上海彩虹室内合唱团": "中国合唱团体，擅长用现代合唱写日常、幽默和城市情绪。",
  "右侧合流": "中国独立乐队，作品在吉他流行和都市情绪之间保持清爽质感。",
  "告五人": "台湾流行摇滚乐团，以男女双主唱和朗朗上口的旋律打动听众。",
  "柯以敏": "马来西亚华语女歌手，以厚实声线和细腻情歌表达见长。",
  "林志炫": "华语实力派男歌手，高音、气息控制和清亮音色极具辨识度。",
  "The Prodigy": "英国电子摇滚/Big Beat 代表，把锐利节拍、朋克能量和舞曲冲击力推到前台。",
  "The Verve": "英国另类摇滚乐队，擅长把迷幻吉他、宏大旋律和忧郁情绪融合。",
  "Inhaler": "爱尔兰独立摇滚乐队，延续明亮吉他摇滚与青春化舞台能量。",
  "Paper Route": "美国独立流行摇滚乐队，作品常以电子质感和宽阔副歌推动情绪。",
  "The Stone Roses": "曼彻斯特独立摇滚传奇，把迷幻、舞曲律动和吉他流行连成一条脉络。",
  "Kraftwerk": "德国电子音乐先驱，用极简节拍和机器美学奠定现代电子乐语言。",
  "Depeche Mode": "英国电子流行与暗色新浪潮代表，合成器声响和冷峻情绪影响深远。",
  "Foo Fighters": "美国摇滚乐队，以直接有力的吉他段落和体育馆级副歌著称。",
  "Pendulum": "澳大利亚鼓打贝斯/电子摇滚乐队，以高速节拍和摇滚冲击力闻名。",
};

const songNotes = {
  209137: "《烟火》出自陈绮贞专辑《太阳》，以极简的吉他与人声捕捉刹那光华般的感伤。",
  209311: "《来不及》出自陈珊妮专辑《完美的呻吟》，是台湾独立音乐场景中以冷冽电子音色包裹深情表达的标志性作品。",
  209530: "《会不会》出自陈绮贞首张专辑《让我想一想》，是她大学生时期创作的代表作，奠定了「华语独立女声」的起点。",
  247426: "中国摇滚女声姜昕的经典作品，以简·奥斯汀为精神坐标，用诗意的词作书写独立女性的内心世界。",
  308150: "李宗盛词曲、辛晓琪演唱的经典女声情歌，电视剧《太阳花》片尾曲，以细腻笔触书写爱情中的不甘与承认。",
  308248: "《友情卡片》出自徐怀钰专辑《向前冲》，以轻快的流行旋律讲述校园友情，承载了一代人的青春记忆。",
  308261: "《失恋布丁》出自徐怀钰首张个人专辑，以俏皮活泼的舞曲风格将失恋的苦涩包装成甜美布丁，是她「平民天后」时代最具代表性的青春曲目。",
  308478: "徐怀钰的经典慢板情歌，以温柔嗓音唱出对过往爱情的反复回味与不舍，是千禧年代华语流行的温暖记忆。",
  316077: "《漂着》出自杨乃文首张专辑《One》，以冷峻低沉的嗓音展现华语乐坛少有的暗黑摇滚气质。",
  316093: "《我给的爱》出自杨乃文集《Silence》，该专辑助她夺得金曲奖最佳国语女演唱人奖。",
  316117: "《明天》出自杨乃文的金曲奖获奖专辑《Silence》，歌词中充满挣扎与渴望，展现了她兼具爆发力与内敛的独特嗓音。",
  385322: "《Lonely God》是中国后摇乐队惘闻的早期代表作之一，以层层递进的吉他音墙和沉静孤绝的氛围表达当代中国后摇的独特美学。",
  540931: "《クリスマス・イブ》是山下達郎 1983 年的曲目，因 JR 东海的电视广告成为日本国民级圣诞歌曲，累计销量超 180 万张。",
  635845: "日本昭和时代创作歌手岡村孝子的经典J-Pop抒情曲，以透明感的嗓音和怀旧的夏日意象捕捉青春与离别的哀愁。",
  642871: "《歌舞伎町の女王》是椎名林檎的第二张单曲，她在实际造访歌舞伎町之前便凭想象写出了这首歌。",
  677976: "《Good-bye My Loneliness》是 ZARD 的出道单曲，由坂井泉水作词、织田哲郎作曲，1991 年发行后开启了坂井泉水传奇的流行摇滚时代。",
  769937: "《I will be with you》是 LOVE PSYCHEDELICO 2001 年发行的单曲，以日英双语交织的演唱和 60 年代英伦摇滚影响而著称。",
  778069: "日本流行组合 My Little Lover 的代表作之一，由女主唱 akko 的清澈嗓音配合小林武史的电子编曲，是 90 年代 J-Pop 的清新经典。",
  804994: "《粉雪》是 レミオロメン 的代表性冬日抒情曲，在日剧与流行文化里流传很广。",
  2065412: "德国电子制作人Ulrich Schnauss与Jonas Munk的梦幻合作，以层层合成器音浪描绘追逐彩虹般的极光之旅。",
  3229863: "美国独立摇滚乐队 Pinback 同名专辑中的代表作，以层层叠加的吉他旋律和慵懒人声交织出独特的数学摇滚质感。",
  3451316: "Sweet Trip 融合电子、盯鞋与 IDM 的经典作品，以碎拍节奏和梦幻吉他编织出一个迷离而甜美的声音梦境。",
  3947467: "美国后摇乐队 Athletics 的经典长篇，以渐进式的情感堆叠和精妙的动态变化著称，是后摇爱好者的必听曲目。",
  4142615: "《Tour de France》体现了 Kraftwerk 对机械律动、运动意象和电子极简美学的迷恋。",
  4174137: "《when you sleep》出自 My Bloody Valentine 的里程碑专辑《Loveless》，人声被录制了十二三遍再叠加而成，被《卫报》形容为「一段迷醉的欣快感」。",
  4281481: "《Alison》常被视作 Slowdive 最温柔也最具入口感的早期代表作之一。",
  4281483: "Slowdive出自经典专辑《Souvlaki》的代表作，以层层叠加的吉他噪音墙与梦幻人声交织，定义了盯鞋美学的巅峰。",
  4338895: "《Made Of Stone》是 The Stone Roses 早期曼彻斯特独立摇滚气质的典型切片。",
  5048430: "Ulrich Schnauss经典专辑《A Strangely Isolated Place》中的标志性曲目，是电子/自赏融合流派的开创之作。",
  16463509: "美国盯鞋乐队 Airiel 的经典之作，密集的吉他音墙与梦幻人声交织，是当代盯鞋复兴浪潮中广受推崇的代表曲目。",
  18298953: "Porcupine Tree 前卫摇滚时期的史诗级长篇，从静谧的氛围铺陈逐渐推向爆裂的金属 riff，展现 Steven Wilson 编织声音叙事的高超功力。",
  19188871: "《Pink Steam》来自 Sonic Youth 后期作品，保留了他们标志性的吉他噪音张力。",
  19189258: "《I Love You Golden Blue》出自 Sonic Youth 2004 年专辑《Sonic Nurse》，由 Kim Gordon 主唱，七分钟的缓慢铺陈弥漫着不安的脆弱与唯美。",
  19204224: "《When the Sun Hits》是 Slowdive 的代表作之一，也是盯鞋乐迷反复提起的经典瞬间。",
  19460377: "《Breathe》是 The Prodigy 最具攻击性的代表曲之一，现场能量极强。",
  19548150: "英国独立乐队 Two Wounded Birds 短暂生涯中的闪光之作，融合冲浪摇滚的复古质感与 60 年代流行旋律，甜美而忧伤。",
  19902624: "Yuck出自2011年同名首专，完美复刻90年代Dinosaur Jr.式的低保真吉他噪音美学，是独立摇滚复兴的重要作品。",
  19902626: "英国独立摇滚乐队 Yuck 首张专辑中的高光曲目，以粗粝的吉他和 90 年代另类摇滚的怀旧质感唱出青春的颓废与躁动。",
  21942066: "英国传奇摇滚乐队 The Stone Roses 的早期作品，充满 80 年代末曼彻斯特独立摇滚的生猛活力与不羁态度。",
  21970528: "《Friday I'm In Love》是 The Cure 最明亮的流行单曲之一，轻快得几乎像一次反差。",
  21970530: "The Cure出自经典专辑《Wish》的深情之作，Robert Smith以Elise为题写给妻子的信，是乐队最具情感深度的曲目之一。",
  21970664: "The Cure出自专辑《Bloodflowers》的落幕曲，作为黑暗三部曲的终章，以忧伤吉他旋律探讨时间流逝与生命的终末。",
  22282040: "特哈诺音乐女王Selena Quintanilla的遗作之一，甜美梦幻的流行曲突破了拉丁音乐的边界，令全球乐迷为之惋惜。",
  22332615: "瑞典梦幻自赏名团The Radio Dept.的代表作，以朦胧的噪音吉他包裹着治愈而疏离的温柔。",
  22567647: "《Sonnet》出自 The Verve 的经典专辑《Urban Hymns》，旋律带有醒目的英伦抒情感。",
  22640730: "Heavenstamp以凌厉的吉他riff与电气化节奏著称，是日本另类摇滚场景中的独特存在。",
  22646842: "東京酒吐座的代表曲目，以MBV式的厚重吉他音墙配合日式旋律感，被视为和式盯鞋浪潮的里程碑。",
  22646844: "東京酒吐座以炸裂的吉他噪音音墙与飘渺女声构建日式自赏的极致美学。",
  22646845: "東京酒吐座的另一首自赏佳作，以暴烈的噪音与轻盈旋律的对比诠释一切刚好的矛盾与平衡。",
  22655301: "日本传奇盯鞋乐队 COALTAR OF THE DEEPERS 的代表曲目，融合厚重失真音墙与甜美旋律，是日系盯鞋的经典教科书级作品。",
  22670572: "the brilliant green出自1998年同名首专，融合英伦摇滚与日式流行旋律，是J-Rock黄金时代的经典。",
  22687362: "日本数学摇滚乐队 LITE 的代表作之一，以复杂的奇数拍节奏和利落的吉他切分见长，展现日本数摇的精湛技艺。",
  22736208: "《Les Enfants Du Paradis》出自 world's end girlfriend 的专辑《The Lie Lay Land》，曲名致敬法国电影《天堂的孩子》，融合古典弦乐与后摇。",
  22736682: "日本独立乐队THE MUSMUS的代表曲目，以青春感的旋律和细腻的吉他编排表达对庇护与归属的渴望。",
  22767670: "日本器乐数学摇滚乐队mudy on the 昨晩的经典作品，以复杂多变的不规则节奏和精密的乐器对话著称。",
  22809495: "té 乐队的另一首代表作，以复杂的节奏变化与旋律堆叠构建出极具冲击力的器乐叙事。",
  25730560: "《Where Are We Now?》是大卫·鲍伊沉寂十年后在 66 岁生日当天突袭发布的复出单曲，歌词回顾了他在柏林的岁月。",
  26098884: "日本器乐摇滚乐队 té 的经典曲目，以层层推进的吉他旋律与爆发性的情绪张力，展现后摇音乐的叙事力量。",
  26194134: "许茹芸标志性「芸式唱腔」代表作之一，同名专辑主打歌，以机场比喻人生旅途中短暂的相遇与离别。",
  26484759: "台湾数学摇滚乐队大象体操早期经典，出自首张专辑《平衡》，以贝斯为主线的器乐编排配合不规则复合节拍，展现三位成员精湛的数学摇滚美学。",
  26545178: "澳大利亚 Drum & Bass 乐队 Pendulum 翻混 The Prodigy 的经典曲目，以重型鼓打贝斯的能量重塑原作，引爆电音现场。",
  26905556: "The Prodigy回归专辑《Invaders Must Die》中的重磅单曲，以标志性的高能量Breakbeat和嘶吼宣告锐舞精神的强势归来。",
  27221160: "俄罗斯后朋克乐队Motorama的代表作，来自专辑《Calendar》，主唱嗓音常与Ian Curtis相较，以冷峻贝斯线和忧郁旋律营造疏离感与向南而行的意象。",
  27632716: "日本盯鞋乐队東京酒吐座的代表曲目，以My Bloody Valentine式的厚实吉他音墙著称，营造出沉默的咆哮般的内爆式情绪张力。",
  27756582: "瑞典盯鞋/梦幻流行乐队Star Horse的作品，以朦胧的吉他音色与慵懒人声营造北欧特有的清冷梦幻氛围。",
  28188038: "英国迷幻摇滚乐队 Temples 的代表曲目，以 60 年代复古迷幻音色为底色，搭配华丽的和声与旋转般的旋律线条。",
  28188044: "英国迷幻摇滚乐队Temples的代表作，以60年代复古迷幻音色和精致编曲获得广泛赞誉。",
  28793502: "邓紫棋为韩寒导演电影《后会无期》演唱的同名主题曲，以空灵的钢琴伴奏与深情唱腔诠释人生中无可挽回的离别。",
  28835597: "日本器乐数学摇滚乐队How to count one to ten的作品，以复杂的吉他指弹与精密节奏编排见长。",
  29127076: "REDЯUM出自专辑《Cinematic Sound Foundation》，以宏大叙事般的器乐铺陈与电影感声响空间著称。",
  29437550: "柯以敏与林志炫的经典对唱，两位实力派唱将以极具张力的和声演绎爱情中的深情与渴望。",
  29600656: "西安后摇乐队琥珀的代表作，以器乐叙事描绘宿醉后仰望星空的迷幻与怅然，沉稳的吉他渐强层层推进至情绪爆发。",
  32857073: "《Head Over Heels》是 Tears for Fears 八十年代流行摇滚时期的代表曲之一。",
  33410514: "日本数学摇滚乐队 toe 的精巧之作，以干净利落的吉他分解和复杂的节奏层次构建出温暖而灵动的器乐世界。",
  40255645: "上海自赏乐队Forsaken Autumn的代表作，用厚重的吉他音墙与空灵人声构建沉溺般的梦幻声景。",
  405311283: "《Everlong》是 Foo Fighters 的核心代表作之一，兼具爆发力和真挚情绪。",
  431753107: "美国独立电子摇滚乐队Paper Route的作品，以闪耀的合成器与脉冲节拍表达真实情感在虚拟时代中的稀缺与珍贵。",
  440411023: "日本独立流行音乐人ラブリーサマーちゃん的代表作，以低保真卧室流行融合俏皮电子元素，表达都市少女的细腻情感。",
  451126141: "热斑 Heat Mark 的冷感之作，以慵懒而略带颓废的嗓音唱出当代年轻人无法开心起来的情绪困境。",
  456185094: "《无赖》出自林忆莲专辑《0》，时隔六年再次为她赢得金曲奖最佳国语女歌手奖。",
  466122584: "热斑Heat Mark出自专辑《无感人》，以冷峻的吉他音色与疏离感的女声融合后朋克与独立摇滚元素。",
  466122586: "热斑Heat Mark的作品，以简约但锋利的吉他编排搭配具有穿透力的女声，表达都市青年的情感疏离。",
  468738015: "英国盯鞋传奇Slowdive解散22年后于2017年复出同名专辑中的曲目，以更加成熟内敛的梦幻吉他音色宣告经典阵容的回归。",
  496902108: "CQ出自专辑《Communication,Cultural,Curiosity Quotient》，以深邃的吉他音墙与漂浮感的人声营造沉浸式声景。",
  524148277: "上海彩虹室内合唱团的代表作，金承志创作的合唱神曲，以磅礴人声描绘彩虹壮美，承载对逝去亲人的深切思念。",
  528568671: "《It's No Good》是 Depeche Mode 后期广为人知的单曲，暗色合成器质感很鲜明。",
  533888370: "爱尔兰后摇名团 God Is An Astronaut 的标志性作品，以钢琴与合成器构筑空灵氛围，逐渐引爆为恢弘的器乐风暴。",
  549361780: "动物园钉子户的青春夏日颂歌，以24帧每秒的夏天比喻少年时代流逝的质感，充满怀旧气息。",
  561307139: "韩国釜山冲浪摇滚乐队Say Sue Me的代表作，以轻快吉他节奏和温润嗓音传递韩国独立音乐独有的温暖。",
  863073353: "中国后摇代表性乐队惘闻的作品，曲名取自《诗经》，以层层递进的器乐叙事营造如水墨画般的东方意境。",
  863112864: "英国曼彻斯特爵士三重奏 GoGo Penguin 的代表作，曲名源自椋鸟群飞的壮观自然现象，融合爵士钢琴、古典结构与电子元素。",
  865907027: "完美倒立以19点52分暮色为题，以电子与吉他交错的迷离声响定格黄昏瞬间的暧昧与忧伤。",
  1297494185: "Megumi Acorda以幽灵为题，用飘渺的和声与疏离的吉他勾勒出若即若离的存在感。",
  1309301943: "日本自赏/梦幻流行乐队きのこ帝国的代表曲目，以椎名佐保的透明女声融合厚实吉他音墙，是J-Shoegaze场景中的经典之作。",
  1321803205: "Megumi Acorda延续其标志性的迷离声响与留白美学，将不安与期待交织成轻巧的音景。",
  1362469519: "爱尔兰摇滚新星 Inhaler（主唱为 U2 主唱 Bono 之子）的早期单曲，以青春躁动和流畅的吉他 riff 展现 Z 世代摇滚的真诫面孔。",
  1377394910: "俄罗斯暗潮项目Yakui The Maid的作品，以减速的电子节拍、采样拼贴和幽暗氛围闻名，将互联网时代的孤独感与暗黑美学结合。",
  1379410324: "日本独立摇滚鬼才betcover!!的作品，以扭曲多变的编曲和病娇式的嗓音展现其独一无二的音乐世界观。",
  1415697454: "台湾独立摇滚乐队逃走鮑伯的作品，以轻快的吉他节奏和少年感的嗓音讲述日常中的不变与变迁。",
  1472090806: "热斑Heat Mark的作品，以更加电气化的编制和英文创作展现乐队风格的拓展。",
  1491150486: "俄罗斯圣彼得堡后黑金/盯鞋乐队Show Me A Dinosaur的作品，将黑金属的爆裂感与盯鞋的梦幻音墙融合。",
  1807796555: "告五人的国民级情歌，将小飞侠中温蒂与侍卫的关系化为温柔守护的寓言，写尽暗恋中的无怨与深情。",
  1810264557: "Tizzy Bac经典曲目现场版，以钢琴摇滚的独特编制唱出倔强的告别与无声的坚守，是华语独立摇滚的里程碑。",
  1814770389: "海德薇乐队的作品，以浪漫的器乐编排描绘漫天星空的壮丽画面，融合后摇的宏大与独立流行的温柔。",
  1816446845: "英国后摇滚/实验乐队 Black Country, New Road 的早期单曲，以念白式演唱、萨克斯旋律与不安的节奏构建出充满文学性的音乐叙事。",
  1819304509: "Megumi Acorda歌如其名，以吉他的意外转折与人声的轻柔渗透营造出无法预料的情感波动。",
  1819305216: "Megumi Acorda以朦胧吉他与人声构建演出结束后残留的余韵与失落氛围。",
  1831469103: "北京后摇乐队文雀的经典作品，以星光闪烁为意象构建器乐叙事，旋律层层递进至璀璨的情绪高潮。",
  1839666622: "马来西亚独立乐队 Go with Strangers 的作品，层层音墙与迷离人声交织，呈现东南亚独立音乐独有的忧伤与浪漫。",
  1878304841: "广州独立乐队乔迁日的作品，以1968年的旅行路线为隐喻，用温暖吉他叙述时间流逝中的迁徙与怀旧。",
  1880177078: "左小祖咒以标志性的荒腔走板式唱腔与充满讽喻的歌词，延续其对中国社会的独特观察。",
  1907428063: "马来西亚独立乐队 Go with Strangers 的作品，融合后摇的宏大叙事与盯鞋的迷幻质感，以温柔而克制的器乐表达内心的孤独。",
  1920414472: "瑞典后摇计划U137的作品，由Moonlit Sailor成员组建，以宏大的管弦乐编排构建银河般的宇宙感。",
  1923496140: "赵登凯的独立创作，以温柔的电子氛围包裹内心深处的敏感情绪，在平静表面下暗涌着对自我与世界的省思。",
  1928741506: "左小祖咒翻唱陈升经典，以沙哑粗粝的嗓音和极简的编曲，赋予这首情歌更深的沧桑与孤寂感。",
  1940232496: "shes green的梦幻之作，以柔和的吉他和声墙包裹温暖治愈的旋律，传递再次微笑的力量。",
  1942729022: "野岸刊以Noctiflorous夜间绽放的花为名，用吉他音墙描绘暗夜中寂静生长的美。",
  1944667883: "北京自赏乐队缺省的代表作，以平原的开阔意象映照内心的辽阔与孤寂，是国产自赏的经典叙事。",
  1958971864: "表情银行MimikBanka的作品，以精致的编曲、诗意的中英文歌词和艺术摇滚气质展现中国独立音乐的前沿探索。",
  1981044211: "热斑Heat Mark延续其冷感独立摇滚风格，以简洁有力的riff和个性女声为标志。",
  1985721103: "日本盯鞋名团東京酒吐座的代表曲目，将厚重的噪音音墙与梦幻人声采样融合，是日系盯鞋入门的必听之作。",
  1996289965: "水中スピカ的作品，以精密的节奏变化、复杂的吉他对话和极具爆发力的器乐段落著称。",
  1996291631: "水中スピカ以复杂多变的节奏编织出日式数摇独有的灵动与精致，歌名Oshiroi意为白粉，暗示传统与虚幻之美。",
  2006762778: "右侧合流以精密的器乐对话展现她的低音——对贝斯手伙伴的致敬，在复杂节拍中流淌着温暖的情谊。",
  2007060010: "美国独立摇滚乐队Wednesday的突破性单曲，从安静民谣爆发为激烈噪音摇滚，被Pitchfork评为2023年度最佳歌曲之一。",
  2012388372: "匿名计划Sadness的黑金属/自赏融合之作，以周五下午五点的意象捕捉一周终结时特有的空茫与忧郁。",
  2015013516: "日本盯鞋新秀 kurayamisaka 的告别主题作品，以层叠噪音吉他包裹朦胧人声，将离别的伤感化作温暖的音墙。",
  2016688503: "2023 年央视春晚经典对唱，黄绮珊与希林娜依高以母女对话形式演绎，细腻刻画了中国式母女之间深沉而内敛的情感羁绊。",
  2021438527: "露波合唱团以俏皮而直接的标题质问，将复古放克律动与现代都市青年的身份困惑巧妙碰撞。",
  2022301202: "Megumi Acorda在模糊的吉他音墙中寄托对未来的不确定与微弱的期盼。",
  2028024866: "白安的治愈之作，以标志性的独特咬字和真挚旋律回应每个感到孤独的人。",
  2028884728: "白色海岸以碎星为意象，在梦幻流行的声景中描绘浪漫破碎后的星辰残片与希望。",
  2030527657: "日本数学摇滚/情绪摇滚乐队JPBS的作品，以错综复杂的吉他编排与情绪化爆发展现日式math rock的独特张力。",
  2046602170: "气象限定Quadrant以中西部情绪摇滚式的吉他编配和中文歌词，融合了青春感伤与器乐爆发。",
  2048173261: "《The Narcissist》是 Blur 复出后备受关注的单曲，带着成熟而克制的英伦摇滚气质。",
  2054517809: "椿乐队的作品，以鲁迅散文诗为灵感，将民间音乐的苍凉与摇滚的爆发力结合，展现底层生命的顽强与不屈。",
  2055817369: "CQ将盯鞋吉他的层层噪音与后摇滚的渐进结构结合，营造出世界末日般的壮丽感。",
  2057572146: "及时撤退Janes Fallback以轻快的电子流行节奏模拟敲门声响，以俏皮方式表达都市情感中的试探与回应。",
  2058064857: "shes green的梦幻之作，以lakes隐喻内心深处的静谧与忧伤，将自然意象与情感流动融为一体。",
  2058064858: "shes green出自EP《wisteria》，以空灵的混响吉他和飘渺的人声营造如紫藤花般缠绕的梦幻声景。",
  2067168881: "蛙池以秋分为题，取自二十四节气，以诗意而冷峻的笔触书写季节更替中的人事变迁。",
  2072623318: "香港独立唱作人 Serrini 的温暖民谣，以诗意的粤语歌词和柔和吉他伴奏，描绘阳光洒落时的温柔与希望。",
  2075594038: "worlds end girlfriend将古典弦乐、电子噪音与后摇滚融合，创造出极具戏剧张力的音乐叙事。",
  2081552364: "香港传奇歌手尹光与Wan K.的跨代合作，以真切的自我独白回顾人生历程，将市井情怀与现代审美融合。",
  2081795112: "蛙池的成名曲，以极具文学性的歌词与爆发力十足的后朋编曲描绘底层青年在城市洪流中的挣扎。",
  2083475233: "张玮玮的单曲，以沉静的叙事与手风琴的悠扬旋律，描绘对叙利亚古城大马士革的诗意想象与人文关怀。",
  2093199247: "芝加哥独立摇滚乐队Friko的作品，以诚挚的演唱与情绪化吉他爆发著称，被Pitchfork誉为2024年最令人期待的新人。",
  2095506436: "气象限定Quadrant的代表作，以密林为隐喻探索内心幽深，融合器乐摇滚的沉浸感与东方美学意境。",
  2095816186: "日本独立摇滚乐队ひとひら的作品，融合数学摇滚的复杂节奏与中西部情绪摇滚的细腻旋律。",
  2097762670: "成都数学摇滚/器乐摇滚乐队 Fayzz 的作品，收录于专辑《Days Gone》，以精密吉他编曲与富于变化的节奏营造失重般下坠的听觉体验。",
  2099601427: "浅水ShallowEnd长达8分钟的纯器乐作品，以字幕式内心独白代替唱腔，将人生的不可逆成长以音乐叙事呈现。",
  2111729095: "中国传奇朋克乐队诱导社的标志性曲目，歌名致敬北野武电影，以粗粝的朋克态度书写青春的叛逆与无奈。",
  2112520890: "索廷以方言和古朴的叙事方式记录岭南地方记忆与风土人情，是中国民谣中罕见的地方志式创作。",
  2112988617: "气象限定Quadrant的作品，以温暖的吉他音色和治愈性歌词传递勇气与陪伴。",
  2114419825: "《归零》是林忆莲专辑《0》的核心曲目之一，以极简电子编曲搭配充满哲思的歌词，呼应从零开始循环往复的主题。",
  2115773460: "Blume popo的作品，以梦幻流行声响构建一个远离尘嚣的精神避难所。",
  2118169873: "LITE以标志性的复杂节拍、跳跃的吉他riff和极具舞蹈性的律动展现J-Math Rock的技术与感染力。",
  2129184895: "The Rose Bites的回归单曲，以诗歌念白贯穿全曲，讲述在上海冬天街头散步的个人冥想。",
  2142540616: "Yuètù以温柔的吉他音色和日式indie的细腻旋律，传递出归处的温暖与归属感。",
  2149555918: "天然味道的作品，以夏日祭的意象勾勒独处的孤寂与青春的诗意，轻快节奏下暗藏淡淡的夏日忧伤。",
  2150753897: "ゲシュタルト乙女的动人创作，以神様为主题探讨信仰、命运与情感的纠葛，编曲融合日系独立摇滚的细腻与叙事感。",
  2158923508: "Heavenstamp的Remaster版作品，以疾走的吉他与电气节拍展现乐队标志性的凌厉风格。",
  2164845852: "韩国情绪/数学摇滚乐队I'm fine! Thank you! And you?的作品，以跳跃的节奏与twinkly guitar展现青春气质。",
  2604846789: "Carsick Cars出自专辑《口》，延续其一贯的噪音摇滚美学，以尖锐的吉他反馈与中文歌词表达告别与重生。",
  2615268539: "德国/土耳其迷幻民谣乐队Derya Yıldırım的作品，以土耳其传统乐器巴格拉玛琴配合迷幻摇滚编排。",
  2615409908: "软骨Gristle联合阿克江Akin与yocho，以电子节拍与另类摇滚融合，展现跨界合作的多元可能性。",
  2620962255: "热斑Heat Mark用冷艳的电子摇滚节奏揭露美好表象下致命的浪漫幻象。",
  2626401610: "PHONO RECORDS与unfoldingskies合作的单曲，以氛围化电子音色与盯鞋吉他纹理交织，探讨意义与虚无之间的模糊地带。",
  2632241806: "俄罗斯后摇/嘶吼摇滚乐队CATS NEVER DIE的作品，以极具爆发力的嘶吼与旋律段落交替。",
  2637176107: "美国创作歌手Aisha Badru的空灵民谣之作，歌曲延续其清新治愈风格，探讨在脆弱中寻找力量。",
  2652646284: "日本盯鞋个人计划polly的作品，以中文标题、日式盯鞋的朦胧吉他音色与轻柔女声描绘日常生活中的微妙情感。",
  2668124242: "王菲久违的新作，以标志性的空灵嗓音吟唱对世界的感恩与回馈，词曲皆淡然而深沉。",
  2668256442: "苏格兰后摇先驱 Mogwai 近年的回归之作，回归早期标志性的动静对比结构，在沉稳铺陈中爆发出不加修饰的力量感。",
  2681408481: "日本盯鞋乐队honeydip的作品，以经典电影《早餐俱乐部》命名，用绵密吉他音墙和怀旧氛围致敬青春与日本自赏音乐的黄金年代。",
  2681412904: "honeydip出自Remaster版专辑《groovy indian summer》，以厚重的吉他失真与甜美旋律的对比著称。",
  2717588324: "陈粒后期作品中极具禅意的一首，以果实隐喻生命的沉淀与成熟，旋律简洁却余味悠长。",
  2718374583: "中国独立乐队迷失克莱因的作品，以迷幻吉他音色和内向型歌词探索现代城市生活中的疏离与自我迷失。",
  2719566483: "美国梦幻流行/盯鞋乐队shes green的代表作，以层层堆叠的吉他混响和慵懒哼唱营造如飞鸟般轻盈而迷离的听觉体验。",
  2730270719: "成都数学摇滚乐队Fayzz的代表作，以精密的器乐编排和不规则的节奏结构在空灵与爆发之间切换自如。",
  2731540197: "英国另类摇滚乐队Wolf Alice出自专辑《Blue Weekend》，以空灵渐进的编曲展现柔美嗓音与爆发力的完美平衡。",
  2750258053: "菲律宾梦幻流行音乐人Megumi Acorda的作品，以低保真吉他和柔软人声刻画猫咪般的慵懒与求救的双重意象。",
  2751093063: "日台混血独立乐队ゲシュタルト乙女与京英一的合作曲，以潮湿绵密的器乐编织刻画东亚雨季特有的朦胧与思念。",
  3368042524: "英国传奇英伦摇滚乐队Suede于2022年发行的单曲，Brett Anderson的嗓音依然充满戏剧张力，以直白的歌名传递关于爱与失去的深沉告白。",
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const duration = (ms) => {
  const seconds = Math.round((ms || 0) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

const getArtistBio = (artists) => {
  const found = artists.find((name) => bios[name]);
  return found ? bios[found] : "";
};

const getSongNote = (songId) => songNotes[songId] || "";

const coverPath = (albumId, songId) => {
  const keys = [albumId, songId].filter(Boolean);
  for (const key of keys) {
    const file = path.join(coverDir, `${key}.jpg`);
    if (fs.existsSync(file)) return `liked_music_covers/${key}.jpg`;
  }
  return "";
};

const tracks = raw.playlist.tracks.map((track, index) => {
  const detail = details[track.id] || details[String(track.id)] || {};
  const artists = (detail.artists || track.ar || []).map((artist) => artist.name).filter(Boolean);
  const album = detail.album || track.al || {};
  return {
    index: index + 1,
    id: track.id,
    title: detail.name || track.name,
    artists,
    artistText: artists.join(" / "),
    album: album.name || "",
    albumId: album.id || track.al?.id,
    duration: duration(detail.duration || track.dt),
    cover: coverPath(album.id || track.al?.id, track.id),
    artistBio: getArtistBio(artists),
    songNote: getSongNote(track.id),
  };
});

const artistCounts = new Map();
for (const track of tracks) {
  for (const artist of track.artists) artistCounts.set(artist, (artistCounts.get(artist) || 0) + 1);
}
const topArtists = [...artistCounts.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 18);

const heroCovers = tracks.filter((track) => track.cover).slice(0, 42);
const trackJson = JSON.stringify(tracks).replace(/</g, "\\u003c");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>咖啡控雷恩喜欢的音乐</title>
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
  --shadow: 0 18px 45px rgba(59, 68, 63, .13);
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
.hero .deco-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(134,169,156,.28);
  pointer-events: none;
  z-index: -1;
}
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
  line-height: 1.05;
  letter-spacing: -.02em;
  max-width: 820px;
  overflow-wrap: anywhere;
  font-weight: 900;
}
.brand-title::before {
  content: "";
  position: absolute;
  left: -.06em;
  top: .12em;
  width: .14em;
  height: .7em;
  background: linear-gradient(180deg, var(--coral) 0%, rgba(240,217,141,.6) 100%);
  border-radius: 999px;
}
.brand-title::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: .22em;
  width: min(280px, 50%);
  height: 2px;
  background: linear-gradient(90deg, rgba(217,120,95,.5), transparent);
  border-radius: 2px;
}
.brand-title span {
  display: block;
  width: fit-content;
  padding-right: .08em;
}
.brand-title span:first-child {
  background: linear-gradient(135deg, #24302f 0%, #49685e 50%, #3a504a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  position: relative;
}
.brand-title span:first-child::after {
  content: "";
  position: absolute;
  right: -.6em;
  top: 50%;
  transform: translateY(-50%);
  width: .3em;
  height: .3em;
  border-radius: 50%;
  background: var(--coral);
  opacity: .7;
}
.brand-title span:last-child {
  position: relative;
  color: var(--moss);
  font-style: italic;
  letter-spacing: .02em;
}
.brand-title span:last-child::after {
  content: "";
  position: absolute;
  left: .02em;
  right: -.04em;
  bottom: .04em;
  height: .16em;
  border-radius: 999px;
  background: rgba(217, 120, 95, .35);
  z-index: -1;
}
.brand-tag {
  display: block;
  width: fit-content;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #24302f;
  color: #fffdf7;
  font-size: 13px;
  line-height: 1;
  letter-spacing: .12em;
  font-weight: 400;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  max-width: 620px;
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
  transition: transform .45s cubic-bezier(.34,1.56,.64,1), box-shadow .35s ease, z-index 0s .15s;
  position: relative;
  z-index: 0;
}
.cover-field img:hover {
  transform: scale(3.1) rotateY(360deg);
  box-shadow: 0 28px 60px rgba(44, 49, 47, .4), 0 0 0 6px rgba(201,223,230,.5);
  z-index: 10;
  transition: transform 2.8s cubic-bezier(.25,.1,.25,1), box-shadow .3s ease, z-index 0s;
}
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
.play-link::before {
  content: "▶";
  font-size: 11px;
  line-height: 1;
}
.play-link:hover {
  transform: translateY(-1px);
  background: var(--moss);
  color: #fffdf7;
}
.play-link:focus-visible {
  outline: 3px solid rgba(217, 120, 95, .34);
  outline-offset: 3px;
}
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
.list .track-index {
  position: static;
  padding: 0 18px 0 8px;
  color: var(--sage);
}
.list .track-body { padding: 10px 14px; }
.list .track h3 { font-size: 18px; }
.list .artist-bio { display: none; }
.list .song-note { display: none; }
.list .play-link {
  left: 7px;
  bottom: 7px;
  min-height: 26px;
  padding: 0 9px 0 8px;
  font-size: 0;
  gap: 0;
}
.list .play-link::before {
  font-size: 10px;
}
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
      <h1 class="brand-title"><span>咖啡控雷恩</span><span>喜欢的音乐</span></h1>
      <div class="brand-tag">LIKED / ${tracks.length}</div>
      <div class="stats">



        <div class="stat"><strong>${tracks.length}</strong><span>首歌曲</span></div>
        <div class="stat"><strong>${artistCounts.size}</strong><span>位艺人</span></div>
        <div class="stat"><strong>${new Set(tracks.map((t) => t.album)).size}</strong><span>张专辑/单曲</span></div>
      </div>
    </div>
    <div class="cover-field" aria-hidden="true">
      ${heroCovers.map((track) => `<img src="${escapeHtml(track.cover)}" alt="">`).join("")}
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
      <p id="result-count">${tracks.length} 首</p>
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
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
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

fs.writeFileSync(outPath, html);
console.log(JSON.stringify({ html: outPath, tracks: tracks.length, artists: artistCounts.size }, null, 2));

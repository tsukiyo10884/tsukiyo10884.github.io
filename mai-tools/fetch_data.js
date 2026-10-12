(async () => {
    const siteOrigin = new URL(document.currentScript.src).origin;

    const pLimit = (concurrency) => {
        const queue = [];
        let activeCount = 0;
        const next = () => {
            activeCount--;
            if (queue.length > 0) {
                queue.shift()();
            }
        };
        const run = async (fn, resolve, reject) => {
            activeCount++;
            const result = (async () => fn())();
            try {
                const res = await result;
                resolve(res);
            } catch (err) {
                reject(err);
            }
            next();
        };
        const enqueue = (fn, resolve, reject) => {
            queue.push(run.bind(null, fn, resolve, reject));
            if (activeCount < concurrency && queue.length > 0) {
                queue.shift()();
            }
        };
        const generator = (fn) => new Promise((resolve, reject) => enqueue(fn, resolve, reject));
        return generator;
    };
    const limit = pLimit(5);

    const fetchHTML = async (url) => {
        const res = await fetch(url, { credentials: "include" });
        const text = await res.text();
        return new DOMParser().parseFromString(text, "text/html");
    }
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const detailData = await fetch('https://dp4p6x0xfi5o9.cloudfront.net/maimai/data.json')
        .then(res => res.json());

    // 譜面資料(定數、封面、日版版本)
    const getSheetInfo = (title, type, difficulty) => {
        const songEntry = detailData.songs.find(s => s.songId === title);
        const sheet = songEntry?.sheets.find(s => s.type === type && s.difficulty === difficulty);
        const internalLevelRaw = sheet?.internalLevel ?? sheet?.internalLevelValue;
        return {
            internalLevel: typeof internalLevelRaw === 'string' ? parseFloat(internalLevelRaw) : internalLevelRaw ?? null,
            image: `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`,
            versionJapan: sheet?.version
        };
    };

    // 歌曲圖示對應的達成狀態
    const CLEAR_FLAGS = ['sync', 'ap', 'app', 'fs', 'fsp', 'fc', 'fcp', 'fdx', 'fdxp'];
    const parseClearFlags = (iconSrcList) => Object.fromEntries(
        CLEAR_FLAGS.map(flag => [flag, iconSrcList.some(src => src.includes(`music_icon_${flag}`))])
    );

    // 歌曲類型(DX/標準)
    const getSongType = (block, iconSelector) =>
        block.querySelector(iconSelector)?.src.includes('music_dx.png') ? 'dx' : 'std';

    // 單曲遊玩紀錄中的note統計(tap/hold/slide/touch/break)
    const NOTE_TYPES = ['tap', 'hold', 'slide', 'touch', 'break'];
    const parseNotes = (doc) => Object.fromEntries(NOTE_TYPES.map((name, i) => {
        const cells = doc.querySelectorAll(`tr:nth-of-type(${i + 2}) td`);
        return [name, {
            critical_perfect: cells[0].textContent.trim(),
            perfect: cells[1].textContent.trim(),
            great: cells[2].textContent.trim(),
            good: cells[3].textContent.trim(),
            miss: cells[4].textContent.trim()
        }];
    }));

    // 萬花筒之門的鑰匙圖片
    const fetchGateKey = async (domain, no) => {
        const gateDoc = await fetchHTML(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=${no}`);
        return {
            gateImg: gateDoc.querySelectorAll('.ks_block img')[1]?.src,
            gateAcvImgHTML: gateDoc.querySelector('.ks_acv_img')?.outerHTML
        };
    };

    const getUserData = async (domain, idx) => {
        const userInfo = {};
        let userDoc;
        if (idx != null) {
            userDoc = await fetchHTML(`${domain}/maimai-mobile/friend/friendDetail/?idx=` + idx);
        } else {
            userDoc = await fetchHTML(`${domain}/maimai-mobile/home/`);
        }
        userInfo.icon = userDoc.querySelector('.w_112.f_l').src;
        userInfo.name = userDoc.querySelector('.name_block.f_l.f_16').textContent;
        userInfo.rating = userDoc.querySelector('.rating_block').textContent;
        userInfo.ratingBase = userDoc.querySelector('.h_30.f_r').src;
        userInfo.courseRank = userDoc.querySelector('.h_35.f_l').src;
        userInfo.courseRankText = userDoc.querySelector('.h_35.f_l').src.match(/course_rank_(\d{2})/)[1];
        userInfo.classRank = userDoc.querySelector('.p_l_10.h_35.f_l').src;
        userInfo.classRankText = userDoc.querySelector('.p_l_10.h_35.f_l').src.match(/class_rank_s_(\d{2})/)[1];
        userInfo.star = userDoc.querySelector('.p_l_10.f_l.f_14').textContent;
        userInfo.userTrophyBlock = userDoc.querySelector('.trophy_block.p_3.t_c.f_0').className;
        userInfo.trophy = userDoc.querySelector('.trophy_inner_block.f_13').textContent;

        if (idx != null) {
            userInfo.id = idx;
        } else {
            const friendCodeDoc = await fetchHTML(`${domain}/maimai-mobile/friend/userFriendCode/`);
            userInfo.id = friendCodeDoc.querySelector('.see_through_block.m_t_5.m_b_5.p_5.t_c.f_15')?.textContent.trim() || '';
        }

        return userInfo;
    };

    const getGateUnlockProgress = async (domain, no, map) => {
        const gate = await fetchGateStatus(domain, no, map);

        const gateSongData = await fetch(`${siteOrigin}/mai-tools/json/gate.json`).then(res => res.json());
        const gateSongs = gateSongData['gate' + no];

        const promises = gateSongs.map((song, i) => limit(async () => {
            const idx = domain == 'jp' ? song.idxJp : song.idxIntl;
            const songDoc = await fetchHTML(domain + '/maimai-mobile/record/musicDetail/?idx=' + idx);
            const songLastPlayedDate = ['remaster', 'master', 'expert', 'advanced', 'basic']
                .map(diff => songDoc.querySelector(`#${diff} td:nth-of-type(2)`)?.textContent.trim())
                .filter(date => date && date !== '―')
                .map(date => new Date(date))
                .sort((a, b) => b - a)[0]?.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) || '0000-00-00';

            await sleep(i * 100);
            return { title: song.title, songLastPlayedDate, type: song.type };
        }));

        gate.keySongs = await Promise.all(promises);
        return gate;
    }

    const getGateRequirements = async (domain, no, map) => {
        const gate = await fetchGateStatus(domain, no, map);

        const gateSongData = await fetch(`${siteOrigin}/mai-tools/json/gate.json`)
            .then(res => res.json());
        gate.keySongs = gateSongData['gate' + no];

        return gate;
    }

    const fetchGateStatus = async (domain, no, map) => {
        const gateDoc = await fetchHTML(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=${no}`);
        const headerImg = gateDoc.querySelector('.w_450')?.src;
        const gateImgHTML = gateDoc.querySelectorAll('.ks_block')[0]?.innerHTML;

        const MapDoc = await fetchHTML(`${domain}/maimai-mobile/map/`);
        const blocks = Array.from(MapDoc.querySelectorAll('.m_10.m_t_0.f_0'));
        const mapHTML = blocks.find(b => b.textContent.includes(map))?.outerHTML;

        return { headerImg, gateImgHTML, mapHTML };
    }

    //////////////////////////////////////////////////////////////////////// start ////////////////////////////////////////////////////////////////////////
    let idx = '';
    const difficulties = ["basic", "advanced", "expert", "master", "remaster"];
    const url = new URL(window.location.href);
    let domain = '';
    let type = '';
    let gate = {};

    domain = url.origin;

    let childWin = null;

    // 開啟主頁面，日版要告知對方切換成日版
    const openIndexPage = () => {
        childWin = window.open(`${siteOrigin}/mai-tools/index.html`);
        setTimeout(() => {
            if (url.origin === "https://maimaidx.jp") {
                childWin.postMessage({ type: "jp", payload: true }, siteOrigin);
            }
        }, 500);
    };

    // 有提供資料的萬花筒之門
    const GATE_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '9', '10'];

    switch (url.pathname) {
        // 自己資訊
        case "/maimai-mobile/home/": {
            type = 'main'
            openIndexPage();
            break;
        }
        // 好友資訊
        case "/maimai-mobile/friend/friendDetail/": {
            idx = url.searchParams.get("idx");
            type = "friend";
            openIndexPage();
            break;
        }
        // 萬花筒區域
        case "/maimai-mobile/map/kaleidxScopeDetail/": {
            if (url.search != null) {
                childWin = window.open(`${siteOrigin}/mai-tools/gate.html`);
                const gateNo = url.searchParams.get("gate");
                if (GATE_NUMBERS.includes(gateNo)) {
                    type = "gate" + gateNo;
                }
            }
            break;
        }
        // 最近遊玩記錄
        case "/maimai-mobile/record/": {
            childWin = window.open(`${siteOrigin}/mai-tools/record.html`);
            type = "record";
            break;
        }
        // 玩家資訊
        case "/maimai-mobile/playerData/": {
            childWin = window.open(`${siteOrigin}/mai-tools/player_data.html`);
            type = "playerData";
            break;
        }
        // 收藏品
        case "/maimai-mobile/collection/":
        case "/maimai-mobile/collection/nameplate/":
        case "/maimai-mobile/collection/frame/":
        case "/maimai-mobile/collection/trophy/":
        case "/maimai-mobile/collection/character/":
        case "/maimai-mobile/collection/editCharacter/":
        case "/maimai-mobile/collection/partner/":
            {
                childWin = window.open(`${siteOrigin}/mai-tools/collection.html`);
                type = "collection";
                break;
            }
    }

    if (type == 'main' || type == 'friend') {
        const script = document.currentScript;
        setTimeout(() => {
            if (script != null) {
                const srcUrl = new URL(script.src);
                const css = srcUrl.searchParams.get('css');
                childWin.postMessage({ type: 'init', payload: css }, siteOrigin);
            } else {
                childWin.postMessage({ type: 'init', payload: null }, siteOrigin);
            }
        }, 1000);

        setTimeout(async () => {
            const songVersionData = await fetch(`${siteOrigin}/mai-tools/json/song_version_intl.json`).then(res => res.json());
            const versionData = await fetch(`${siteOrigin}/mai-tools/json/version.json`).then(res => res.json());

            // 國際版版本名稱(找不到時視為最新版本；normalize時轉換成站上顯示的名稱)
            const getVersionInternational = (title, type, normalize) => {
                let version = songVersionData[title + "__" + type];
                if (version === undefined) {
                    version = versionData[versionData.length - 1].versionName;
                }
                if (normalize) {
                    if (version.includes('でらっくす')) {
                        version = version.replace('maimaiでらっくす', 'でらっくす');
                    }
                    if (version.includes('Splash')) {
                        version = version.replace('Splash', 'スプラッシュ');
                    }
                }
                return version;
            };

            let userInfo = {};
            const songs = [];
            let exportData = {};

            // 自己資訊
            if (idx === '') {
                userInfo = await getUserData(domain, null);

                if (userInfo.name === "†Ａｙｏｏｏω†") {
                    childWin.postMessage({ type: "special", payload: 'ayo' }, siteOrigin);
                } else if (userInfo.name === "ＸＵ☆Ａ　") {
                    childWin.postMessage({ type: "special", payload: 'axun' }, siteOrigin);
                }

                // 歌曲資訊
                for (let i = 0; i < difficulties.length; i++) {
                    childWin.postMessage({ type: "difficulty", payload: difficulties[i] }, siteOrigin);
                    const doc = await fetchHTML(`${domain}/maimai-mobile/record/musicGenre/search/?genre=99&diff=${i}`);
                    const blocks = doc.querySelectorAll('div.w_450.m_15.p_r.f_0');

                    blocks.forEach(block => {
                        const type = getSongType(block, '.music_kind_icon');
                        let title = block.querySelector('.music_name_block')?.textContent || "　";
                        if (title === "Bad Apple!! feat nomico") {
                            title = "Bad Apple!! feat.nomico";
                        }

                        const score = parseFloat(
                            block.querySelector('.music_score_block.w_112')?.textContent.trim().replace('%', '') || "0"
                        ).toFixed(4) + "%";

                        const { internalLevel, image, versionJapan } = getSheetInfo(title, type, difficulties[i]);
                        const versionInternational = getVersionInternational(title, type, true);

                        const iconSrcList = Array.from(block.querySelectorAll('.h_30.f_r')).map(el => el.src);
                        const flags = parseClearFlags(iconSrcList);

                        songs.push({
                            type, title, score, difficulty: difficulties[i], versionInternational, versionJapan,
                            internalLevel, image, ...flags
                        });
                    });
                }

                //R值表
                const ratingDoc = await fetchHTML(`${domain}/maimai-mobile/home/ratingTargetMusic/`);
                const ratingBlocks = ratingDoc.querySelectorAll(".pointer.w_450.m_15.p_3.f_0");
                ratingBlocks.forEach(ratingblock => {
                    const cls = [...ratingblock.classList].find(c =>
                        c.startsWith('music_') && c.endsWith('_score_back')
                    );
                    let difficulty = cls
                        .replace('music_', '')
                        .replace('_score_back', '');

                    const type = getSongType(ratingblock, '.music_kind_icon');
                    let title = ratingblock.querySelector('.music_name_block')?.textContent || "　";
                    if (title === "Bad Apple!! feat nomico") {
                        title = "Bad Apple!! feat.nomico";
                    }
                    const score = parseFloat(
                        ratingblock.querySelector('.music_score_block.w_150')?.textContent.trim().replace('%', '') || "0"
                    ).toFixed(4) + "%";
                    if (songs.findIndex(s => s.title === title && s.type === type && s.difficulty === difficulty) === -1) {
                        const { internalLevel, image, versionJapan } = getSheetInfo(title, type, difficulty);
                        // R值表中才有的歌，不做版本名稱轉換(維持原行為)
                        const versionInternational = getVersionInternational(title, type, false);

                        songs.push({
                            type, title, score, difficulty, versionInternational, versionJapan,
                            internalLevel, image
                        });
                    }
                });

                // 段位資料
                childWin.postMessage({ type: "course", payload: null }, siteOrigin);
                const courseDoc = await fetchHTML(`${domain}/maimai-mobile/record/course/`);
                const courseBlocks = courseDoc.querySelectorAll("div.w_480.f_0");

                const course = [];

                for (const courseBlock of courseBlocks) {
                    let type = "";
                    const headerImg = courseBlock.querySelector("img.w_480");
                    if (headerImg) {
                        const src = headerImg.src;
                        if (src.includes("2Bakl72Qo")) type = "真段位認定";
                        else if (src.includes("1C6ZZPuoj")) type = "段位認定";
                        else if (src.includes("3uT2WsrBT")) type = "Random段位認定";
                    }

                    const courses = [];
                    const items = courseBlock.querySelectorAll("div.p_r.p_5");
                    for (const item of items) {
                        const idx = item.querySelector("input[name=idx]")?.value;
                        if (!idx) continue;
                        const detailDoc = await fetchHTML(`${domain}/maimai-mobile/record/courseDetail/?idx=${idx}`);

                        const clearImg = detailDoc.querySelector("img.course_clear")?.src || "";
                        const isClear = clearImg.includes("icon_course_clear.png");

                        const courseName = detailDoc.querySelector("img.course_img.h_55")?.src.match(/course_(\d{4})/)[1];
                        const remainLife = detailDoc.querySelector(".course_life_txt.f_13.t_c")?.textContent.trim() || "";
                        const totalScore = detailDoc.querySelector(".course_achievement_txt.t_r")?.textContent.replace(/\s+/g, "") || "";

                        const songs = [];
                        detailDoc.querySelectorAll(".coursemusic_container.w_430.p_r.f_0").forEach(song => {
                            const score = song.querySelector(".music_score_block.w_84")?.textContent.trim() || "";
                            const lifeRaw = song.querySelector(".coursemusic_life_txt.f_12")?.textContent.trim() || "";
                            const life = lifeRaw.split("/")[1] + "->" + lifeRaw.split("/")[0] + '(-' + (lifeRaw.split("/")[1] - lifeRaw.split("/")[0]) + ')';
                            songs.push({ score, life });
                        });

                        courses.push({ courseName, remainLife, totalScore, isClear, songs });
                    }

                    course.push({ type, courseRecord: courses });
                }

                // Circle資料
                childWin.postMessage({ type: "circle", payload: null }, siteOrigin);
                const circleDoc = await fetchHTML(`${domain}/maimai-mobile/circle/`);
                const circleName = circleDoc.querySelector(".circle_profile_circle_name span")?.textContent.trim() || "";
                const circlePt = circleDoc.querySelectorAll(".circle_totalpoint_point.f_29.f_b span")[0]?.textContent.trim() || "";
                const circleRank = circleDoc.querySelectorAll(".circle_pointranking_point.f_29.f_b span")[1]?.textContent.trim() || "";

                const circleRankingDoc = await fetchHTML(`${domain}/maimai-mobile/circle/circleRanking/`);
                const rankingPeriod = circleRankingDoc.querySelector(".circle_ranking_season_bottom_txt")?.textContent.trim() || "";

                const circleMemberDoc = await fetchHTML(`${domain}/maimai-mobile/circle/circleMember/`);

                const members = [];
                circleMemberDoc.querySelectorAll(".basic_block").forEach(member => {
                    const name = member.querySelector(".name_block.f_l.f_16")?.textContent.trim() || "";    
                    const pt = member.querySelector(".p_t_10.p_r_10.t_r")?.textContent.replace("PT", "").trim() || "";
                    members.push({ name, pt });
                });

                const circle = { circleName, circlePt, circleRank, rankingPeriod, members: members.slice(1) };

                exportData = {
                    userInfo,
                    songs,
                    course,
                    circle
                };
            }
            // 好友資訊
            else {
                userInfo = await getUserData(domain, idx);

                for (let i = 0; i < difficulties.length; i++) {
                    childWin.postMessage({ type: "difficulty", payload: difficulties[i] }, siteOrigin);
                    const doc = await fetchHTML(`${domain}/maimai-mobile/friend/friendGenreVs/battleStart/?genre=99&diff=${i}&idx=${idx}`);
                    const blocks = doc.querySelectorAll('div.w_450.m_15.p_3.f_0');

                    blocks.forEach(block => {
                        const type = getSongType(block, '.music_kind_icon');
                        const title = block.querySelector('.music_name_block')?.textContent.trim() || "";

                        const el = block.querySelectorAll('.p_r.w_120.f_b')[1];
                        const text = el?.textContent.trim();
                        const score = parseFloat(text && text !== '― %' ? text.replace('%', '') : '0').toFixed(4) + "%";

                        const { internalLevel, image, versionJapan } = getSheetInfo(title, type, difficulties[i]);
                        const versionInternational = getVersionInternational(title, type, true);

                        const tdIcon = block.querySelector('.t_r.f_0');
                        const iconSrcList = Array.from(tdIcon?.querySelectorAll('img') || []).map(el => el.src);
                        const flags = parseClearFlags(iconSrcList);

                        songs.push({
                            type, title, score, difficulty: difficulties[i], versionInternational, versionJapan,
                            internalLevel, image, ...flags
                        });
                    });
                }

                exportData = {
                    userInfo,
                    songs
                };
            }

            setTimeout(async () => {
                if (idx === '') {
                    childWin.postMessage({ type: "result", payload: exportData }, siteOrigin);

                    // 取得歷史R值
                    const recordListDoc = await fetchHTML(`${domain}/maimai-mobile/record/`);
                    const idxs = [...recordListDoc.querySelectorAll('input[name="idx"]')].map(el => el.value);
                    let ratingHistory = await Promise.all(idxs.map((idx, i) => limit(async () => {
                        const recordDoc = await fetchHTML(`${domain}/maimai-mobile/record/playlogDetail/?idx=${idx}`);

                        const data = {
                            record_date: recordDoc.querySelectorAll('.sub_title .v_b')[1]?.textContent.trim(),
                            rating: recordDoc.querySelectorAll('.rating_block')[1]?.textContent.trim() ?? recordDoc.querySelectorAll('.rating_block')[0]?.textContent.trim()
                        };
                        await sleep(i * 100);
                        return data;
                    })));
                    const uniqeRating = new Map();
                    ratingHistory.toReversed().forEach(item => {
                        if (!uniqeRating.has(item.rating)) {
                            uniqeRating.set(item.rating, item);
                        }
                    })
                    ratingHistory = Array.from(uniqeRating.values());
                    childWin.postMessage({ type: "ratingHistory", payload: ratingHistory }, siteOrigin);

                } else {
                    childWin.postMessage({ type: "result-friend", payload: exportData }, siteOrigin);
                }
            }, 500);
        }, 1500);
    }
    else if (type.includes('gate')) {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, siteOrigin);
        }, 500);
        const no = parseInt(type.replace('gate', ''), 10);
        const isJp = url.origin === "https://maimaidx.jp";
        switch (no) {
            // 青門
            case 1:
                gate = await getGateUnlockProgress(domain, no, 'スカイストリートちほー6');
                break;
            // 白門
            case 2:
                gate = await getGateRequirements(domain, no, '天界ちほー8');
                break;
            // 紫門
            case 3:
                gate = await getGateRequirements(domain, no, 'BLACK ROSEちほー10');
                break;
            // 黑門
            case 4:
                gate = await getGateUnlockProgress(domain, no, 'メトロポリスちほー9');
                break;
            // 黃門
            case 5:
                gate = await getGateRequirements(domain, no, 'なないろちほー');
                break;
            // 紅門
            case 6:
                gate = await getGateUnlockProgress(domain, no, 'ドラゴンちほー4');
                break;
            // 塔
            case 7: {
                gate = await fetchGateStatus(domain, 7, '7sRefちほー4');

                const keys = [1, 2, 3, 4, 5, 6];
                gate.key = await Promise.all(keys.map(i => fetchGateKey(domain, i)));
                break;
            }

            // 希望之門
            case 9: {
                const { headerImg, gateImgHTML } = await fetchGateStatus(domain, 9, null);
                gate = { headerImg, gateImgHTML };
                break;
            }

            // 萬花筒
            case 10: {
                const { headerImg, gateImgHTML } = await fetchGateStatus(domain, 10, null);
                gate = { headerImg, gateImgHTML };
                gate.key = await fetchGateKey(domain, 7);
                break;
            }
        }
        // 日版要用日版的開放日期判斷，帶給接收頁面
        if (isJp) {
            gate.domain = 'jp';
        }
        setTimeout(() => {
            childWin.postMessage({ type: "gate" + no, payload: gate }, siteOrigin);
        }, 500);
    }
    // 最近遊玩紀錄
    else if (type === "record") {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, siteOrigin);
        }, 1000);

        const idxs = [...document.querySelectorAll('input[name="idx"]')].map(el => el.value);
        const result = await Promise.all(idxs.map((idx, i) => limit(async () => {
            const recordDoc = await fetchHTML(`${domain}/maimai-mobile/record/playlogDetail/?idx=${idx}`);

            const title = recordDoc.querySelector('.basic_block').childNodes[2].textContent.trim();
            const difficulty = recordDoc.querySelector('.playlog_diff').src.replace('https://maimaidx-eng.com/maimai-mobile/img/diff_', '').replace('.png', '');
            const type = getSongType(recordDoc, '.playlog_music_kind_icon');

            const sheetInfo = getSheetInfo(title, type, difficulty);
            const internalLevel = sheetInfo.internalLevel ?? recordDoc.querySelector('.music_lv_back').textContent.trim();

            const data = {
                no: i + 1,
                date: recordDoc.querySelectorAll('.sub_title .v_b')[1].textContent.trim(),
                track: recordDoc.querySelector('.red.f_b.v_b').textContent.trim(),
                title: title,
                type: type,
                internalLevel: internalLevel,
                difficulty: difficulty,
                image: recordDoc.querySelector('.music_img').src,
                score: recordDoc.querySelector('.playlog_achievement_txt').textContent.trim(),
                score_new_record: recordDoc.querySelector('.playlog_achievement_newrecord') ? true : false,
                dx_score: recordDoc.querySelector('.white.p_r_5').textContent.trim(),
                dx_score_new_record: recordDoc.querySelector('.playlog_deluxscore_newrecord') ? true : false,
                fast: recordDoc.querySelectorAll('.playlog_fl_block .p_t_5')[0].textContent.trim(),
                late: recordDoc.querySelectorAll('.playlog_fl_block .p_t_5')[1].textContent.trim(),
                star: recordDoc.querySelector('.playlog_deluxscore_star')?.src,
                achive_1: recordDoc.querySelectorAll('.h_35.m_5.f_l')[0].src,
                achive_2: recordDoc.querySelectorAll('.h_35.m_5.f_l')[1].src,
                rating: recordDoc.querySelectorAll('.rating_block')[1]?.textContent.trim() ?? recordDoc.querySelectorAll('.rating_block')[0]?.textContent.trim(),
                rating_plus: recordDoc.querySelector('.t_r.f_0 span').textContent.trim(),
                notes: parseNotes(recordDoc),
                max_combo: recordDoc.querySelectorAll('.col2 .white')[0].textContent.trim(),
                max_sync: recordDoc.querySelectorAll('.col2 .white')[1].textContent.trim()
            };
            await sleep(i * 100);
            return data;
        })));

        childWin.postMessage({ type: "record", payload: result }, siteOrigin);
    }
    // 計算class
    else if (type === "playerData") {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, siteOrigin);
        }, 1000);

        const playerDataDoc = await fetchHTML(`${domain}/maimai-mobile/playerData/`);

        const classData = {
            html: playerDataDoc.querySelector('.town_block').outerHTML,
            img: playerDataDoc.querySelector(".w_160.p_15.m_r_10").src,
            text: playerDataDoc.querySelector('.w_160.p_15.m_r_10').src.match(/class_rank_l_(\d{2})/)[1],
            point: playerDataDoc.querySelector('.class_point_txt .f_29.f_b').textContent.trim()
        }

        setTimeout(() => {
            childWin.postMessage({ type: "playerData", payload: classData }, siteOrigin);
        }, 1500);
    }
    // 收藏品排列模擬
    else if (type === "collection") {
        const iconDoc = await fetchHTML(`${domain}/maimai-mobile/collection/`, { credentials: 'include' });
        const icon = iconDoc.querySelector('.w_80.m_r_10.f_l').src;

        const nameplateDoc = await fetchHTML(`${domain}/maimai-mobile/collection/nameplate`, { credentials: 'include' });
        const nameplate = nameplateDoc.querySelector('.w_396.m_r_10').src;

        const frameDoc = await fetchHTML(`${domain}/maimai-mobile/collection/frame`, { credentials: 'include' });
        const frame = frameDoc.querySelector('.w_396.m_r_10').src;

        const characterDoc = await fetchHTML(`${domain}/maimai-mobile/collection/character`, { credentials: 'include' });
        const characters = Array.from(characterDoc.querySelectorAll('.collection_setting_block .chara_cycle_img')).map(img => img.src);

        const charactersLevel = Array.from(
            characterDoc.querySelectorAll('.see_through_block.collection_setting_block .collection_chara_img_block')
        ).map(block => {
            const lvEl = block.querySelector('.collection_chara_lv_block.f_13');
            const rebornEl = block.querySelector('.collection_chara_awakening_block_reborn_txt.f_11');

            return {
                lv: lvEl ? lvEl.textContent.replace('Lv', '').trim() : '',
                reborn: rebornEl ? rebornEl.textContent.trim() : ''
            };
        });
        const homeDoc = await fetchHTML(`${domain}/maimai-mobile/home`, { credentials: 'include' });
        const name = homeDoc.querySelector('.name_block.f_l.f_16').textContent;
        const rating = homeDoc.querySelector('.rating_block')?.textContent;
        const ratingBase = homeDoc.querySelector('.h_30.f_r')?.src;
        const courseRank = homeDoc.querySelector('.h_35.f_l')?.src;
        const classRank = homeDoc.querySelector('.p_l_10.h_35.f_l')?.src;
        const trophyBlock = homeDoc.querySelector('.trophy_block.p_3.t_c.f_0').className;
        const trophy = homeDoc.querySelector('.trophy_inner_block.f_13').textContent;

        // 玩家在maimai-net設定的顯示項目(R值/段位/Class)
        const optionDoc = await fetchHTML(`${domain}/maimai-mobile/home/userOption/updateUserOption/`, { credentials: 'include' });
        const dispRate = optionDoc.querySelector('select[name=dispRate]')?.value ?? null;

        const circleDoc = await fetchHTML(`${domain}/maimai-mobile/circle/`, { credentials: 'include' });
        const circleName = circleDoc.querySelector('.circle_profile_circle_name span')?.textContent.trim() || '';
        const circleImg = circleDoc.querySelector('.circle_profile_class img')?.src;


        const collections = {
            icon,
            nameplate,
            frame,
            trophy,
            trophyBlock,
            characters,
            charactersLevel,
            name,
            rating,
            ratingBase,
            courseRank,
            classRank,
            dispRate,
            circleName,
            circleImg
        }

        console.log(collections);
        setTimeout(() => {
            childWin.postMessage({ type: "collection", payload: collections }, siteOrigin);
        }, 1000);
    }
})();
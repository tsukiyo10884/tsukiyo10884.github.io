(async () => {
    const fetchHTML = async (url) => {
        const res = await fetch(url, { credentials: "include" });
        const text = await res.text();
        return new DOMParser().parseFromString(text, "text/html");
    }
    const detailData = await fetch('https://dp4p6x0xfi5o9.cloudfront.net/maimai/data.json')
        .then(res => res.json());

    const getUserData = async (url) => {
        const userInfo = {};
        const userDoc = await fetchHTML(url);
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

        return userInfo;
    };

    const getGateUnlockProgress = async (domain, no, map) => {
        const gate = {};

        const gateData = await fetchGateStatus(domain, no, map);
        gate.headerImg = gateData.headerImg;
        gate.gateImgHTML = gateData.gateImgHTML;
        gate.mapHTML = gateData.mapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json').then(res => res.json());
        gate.keySongs = [];
        const gateSongs = gateSongData['gate' + no];
        let count = 0;
        for (const song of gateSongs) {
            const songDoc = await fetchHTML(domain + song.url);
            const songLastPlayedDate_remaster = songDoc.querySelector('#remaster td:nth-of-type(2)')?.textContent.trim();
            const songLastPlayedDate_master = songDoc.querySelector('#master td:nth-of-type(2)')?.textContent.trim();
            const songLastPlayedDate_expert = songDoc.querySelector('#expert td:nth-of-type(2)')?.textContent.trim();
            const songLastPlayedDate_advanced = songDoc.querySelector('#advanced td:nth-of-type(2)')?.textContent.trim();
            const songLastPlayedDate_basic = songDoc.querySelector('#basic td:nth-of-type(2)')?.textContent.trim();
            const songLastPlayedDate = [songLastPlayedDate_remaster, songLastPlayedDate_master, songLastPlayedDate_expert, songLastPlayedDate_advanced, songLastPlayedDate_basic]
                .filter(date => date && date !== '―')
                .map(date => new Date(date))
                .sort((a, b) => b - a)[0]?.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) || '0000-00-00';

            gate.keySongs.push({ title: song.title, songLastPlayedDate });

            // 每25頁就延遲一下，避免被鎖連線
            count++;
            if (count % 25 === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        return gate;
    }

    const getGateRequirements = async (domain, no, map) => {
        const gate = {};

        const gateData = await fetchGateStatus(domain, no, map);
        gate.headerImg = gateData.headerImg;
        gate.gateImgHTML = gateData.gateImgHTML;
        gate.mapHTML = gateData.mapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json')
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
        const MapHTML = blocks.find(b => b.textContent.includes(map))?.outerHTML;
        const mapHTML = MapHTML;

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

    switch (url.pathname) {
        // 自己資訊
        case "/maimai-mobile/home/": {
            type = 'main'
            childWin = window.open("https://tsukiyo10884.github.io/mai-tools/index.html");
            setTimeout(() => {
                if (url.origin === "https://maimaidx.jp") {
                    childWin.postMessage({ type: "jp", payload: true }, "https://tsukiyo10884.github.io");
                }
            }, 500);
            break;
        }
        // 好友資訊
        case "/maimai-mobile/friend/friendDetail/": {
            idx = url.searchParams.get("idx");
            childWin = window.open("https://tsukiyo10884.github.io/mai-tools/index.html");
            type = "friend";
            setTimeout(() => {
                if (url.origin === "https://maimaidx.jp") {
                    childWin.postMessage({ type: "jp", payload: true }, "https://tsukiyo10884.github.io");
                }
            }, 500);
            break;
        }
        // 萬花筒區域
        case "/maimai-mobile/map/kaleidxScopeDetail/": {
            if (url.search != null) {

                childWin = window.open("https://tsukiyo10884.github.io/mai-tools/gate.html");
                if (url.origin === "https://maimaidx.jp") {
                    gate.domain = 'jp';
                }
                switch (url.search) {
                    // 青門
                    case "?gate=1":
                        type = "gate1";
                        break;
                    // 白門
                    case "?gate=2":
                        type = "gate2";
                        break;
                    // 紫門
                    case "?gate=3":
                        type = "gate3";
                        break;
                    // 黑門
                    case "?gate=4":
                        type = "gate4";
                        break;
                    // 黃門
                    case "?gate=5":
                        type = "gate5";
                        break;
                    // 紅門
                    case "?gate=6":
                        type = "gate6";
                        break;
                    // 塔
                    case "?gate=7":
                        type = "gate7";
                        break;
                    // 希望之門
                    case "?gate=9":
                        type = "gate9";
                        break;
                    // 萬花筒
                    case "?gate=10":
                        type = "gate10";
                        break;
                }
            }
            break;
        }
        // 最近遊玩記錄
        case "/maimai-mobile/record/": {
            childWin = window.open("https://tsukiyo10884.github.io/mai-tools/record.html");
            type = "record";
            break;
        }
        // 玩家資訊(player-data)
        case "/maimai-mobile/playerData/": {
            childWin = window.open("https://tsukiyo10884.github.io/mai-tools/player_data.html");
            type = "playerData";
            break;
        }
    }

    if (type == 'main' || type == 'friend') {
        const script = document.currentScript;
        setTimeout(() => {
            if (script != null) {
                const srcUrl = new URL(script.src);
                const css = srcUrl.searchParams.get('css');
                childWin.postMessage({ type: 'init', payload: css }, "https://tsukiyo10884.github.io");
            } else {
                childWin.postMessage({ type: 'init', payload: null }, "https://tsukiyo10884.github.io");
            }
        }, 1000);

        setTimeout(async () => {
            const songVersionData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/song_version_intl.json').then(res => res.json());
            const versionData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/version.json').then(res => res.json());

            let userInfo = {};
            const songs = [];
            let exportData = {};

            // 自己資訊
            if (idx === '') {
                userInfo = await getUserData(`${domain}/maimai-mobile/home/`);

                if (userInfo.name === "†Ａｙｏｏｏω†") {
                    childWin.postMessage({ type: "special", payload: 'ayo' }, "https://tsukiyo10884.github.io");
                } else if (userInfo.name === "ＸＵ☆Ａ　") {
                    childWin.postMessage({ type: "special", payload: 'axun' }, "https://tsukiyo10884.github.io");
                }

                // 歌曲資訊
                for (let i = 0; i < difficulties.length; i++) {
                    childWin.postMessage({ type: "difficulty", payload: difficulties[i] }, "https://tsukiyo10884.github.io");
                    const doc = await fetchHTML(`${domain}/maimai-mobile/record/musicGenre/search/?genre=99&diff=${i}`);
                    const blocks = doc.querySelectorAll('div.w_450.m_15.p_r.f_0');

                    blocks.forEach(block => {
                        const type = block.querySelector('.music_kind_icon')?.src.includes('music_dx.png') ? 'dx' : 'std';
                        let title = block.querySelector('.music_name_block')?.textContent || "　";
                        if (title === "Bad Apple!! feat nomico") {
                            title = "Bad Apple!! feat.nomico";
                        }

                        const score = parseFloat(
                            block.querySelector('.music_score_block.w_112')?.textContent.trim().replace('%', '') || "0"
                        ).toFixed(4) + "%";

                        const songEntry = detailData.songs.find(s => s.songId === title);
                        const sheet = songEntry?.sheets.find(s => s.type === type && s.difficulty === difficulties[i]);

                        const internalLevelRaw = sheet?.internalLevel ?? sheet?.internalLevelValue;
                        const internalLevel = typeof internalLevelRaw === 'string' ? parseFloat(internalLevelRaw) : internalLevelRaw ?? null;
                        const image = `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`;

                        let versionInternational = songVersionData[title + "__" + type];
                        if (versionInternational === undefined) {
                            versionInternational = versionData[versionData.length - 1].versionName;
                        }
                        if (versionInternational.includes('でらっくす')) {
                            versionInternational = versionInternational.replace('maimaiでらっくす', 'でらっくす');
                        }
                        if (versionInternational.includes('Splash')) {
                            versionInternational = versionInternational.replace('Splash', 'スプラッシュ');
                        }
                        const versionJapan = sheet?.version;

                        const iconSrcList = Array.from(block.querySelectorAll('.h_30.f_r')).map(el => el.src);
                        const flags = {
                            sync: iconSrcList.some(src => src.includes('music_icon_sync')),
                            ap: iconSrcList.some(src => src.includes('music_icon_ap')),
                            app: iconSrcList.some(src => src.includes('music_icon_app')),
                            fs: iconSrcList.some(src => src.includes('music_icon_fs')),
                            fsp: iconSrcList.some(src => src.includes('music_icon_fsp')),
                            fc: iconSrcList.some(src => src.includes('music_icon_fc')),
                            fcp: iconSrcList.some(src => src.includes('music_icon_fcp')),
                            fdx: iconSrcList.some(src => src.includes('music_icon_fdx')),
                            fdxp: iconSrcList.some(src => src.includes('music_icon_fdxp')),
                        };

                        songs.push({
                            type, title, score, difficulty: difficulties[i], versionInternational, versionJapan,
                            internalLevel, image, ...flags
                        });
                    });
                }

                // 段位資料
                childWin.postMessage({ type: "course", payload: null }, "https://tsukiyo10884.github.io");
                const doc = await fetchHTML(`${domain}/maimai-mobile/record/course/`);
                const blocks = doc.querySelectorAll("div.w_480.f_0");

                const course = [];

                for (const block of blocks) {
                    let type = "";
                    const headerImg = block.querySelector("img.w_480");
                    if (headerImg) {
                        const src = headerImg.src;
                        if (src.includes("2Bakl72Qo")) type = "真段位認定";
                        else if (src.includes("1C6ZZPuoj")) type = "段位認定";
                        else if (src.includes("3uT2WsrBT")) type = "Random段位認定";
                    }

                    const courses = [];
                    const items = block.querySelectorAll("div.p_r.p_5");
                    for (const item of items) {
                        const idx = item.querySelector("input[name=idx]")?.value;
                        if (!idx) continue;
                        const detailUrl = `${domain}/maimai-mobile/record/courseDetail/?idx=${idx}`;
                        const detailDoc = await fetchHTML(detailUrl);

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

                exportData = {
                    userInfo,
                    songs,
                    course
                };
            }
            // 好友資訊
            else {
                userInfo = await getUserData(`${domain}/maimai-mobile/friend/friendDetail/?idx=` + idx);

                for (let i = 0; i < difficulties.length; i++) {
                    childWin.postMessage({ type: "difficulty", payload: difficulties[i] }, "https://tsukiyo10884.github.io");
                    const doc = await fetchHTML(`${domain}/maimai-mobile/friend/friendGenreVs/battleStart/?genre=99&diff=${i}&idx=${idx}`);
                    const blocks = doc.querySelectorAll('div.w_450.m_15.p_3.f_0');

                    blocks.forEach(block => {
                        const type = block.querySelector('.music_kind_icon')?.src.includes('music_dx.png') ? 'dx' : 'std';
                        const title = block.querySelector('.music_name_block')?.textContent.trim() || "";

                        const el = block.querySelectorAll('.p_r.w_120.f_b')[1];
                        const text = el?.textContent.trim();
                        const score = parseFloat(text && text !== '― %' ? text.replace('%', '') : '0').toFixed(4) + "%";

                        const songEntry = detailData.songs.find(s => s.songId === title);
                        const sheet = songEntry?.sheets.find(s => s.type === type && s.difficulty === difficulties[i]);

                        const internalLevelRaw = sheet?.internalLevel ?? sheet?.internalLevelValue;
                        const internalLevel = typeof internalLevelRaw === 'string' ? parseFloat(internalLevelRaw) : internalLevelRaw ?? null;
                        const image = `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`;

                        let versionInternational = songVersionData[title + "__" + type];
                        if (versionInternational === undefined) {
                            versionInternational = versionData[versionData.length - 1].versionName;
                        }
                        if (versionInternational.includes('でらっくす')) {
                            versionInternational = versionInternational.replace('maimaiでらっくす', 'でらっくす');
                        }
                        if (versionInternational.includes('Splash')) {
                            versionInternational = versionInternational.replace('Splash', 'スプラッシュ');
                        }
                        const versionJapan = sheet?.version;

                        const tdIcon = block.querySelector('.t_r.f_0');
                        const iconSrcList = Array.from(tdIcon?.querySelectorAll('img') || []).map(el => el.src);
                        const flags = {
                            sync: iconSrcList.some(src => src.includes('music_icon_sync')),
                            ap: iconSrcList.some(src => src.includes('music_icon_ap')),
                            app: iconSrcList.some(src => src.includes('music_icon_app')),
                            fs: iconSrcList.some(src => src.includes('music_icon_fs')),
                            fsp: iconSrcList.some(src => src.includes('music_icon_fsp')),
                            fc: iconSrcList.some(src => src.includes('music_icon_fc')),
                            fcp: iconSrcList.some(src => src.includes('music_icon_fcp')),
                            fdx: iconSrcList.some(src => src.includes('music_icon_fdx')),
                            fdxp: iconSrcList.some(src => src.includes('music_icon_fdxp')),
                        };

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

            setTimeout(() => {
                childWin.postMessage({ type: "result", payload: exportData }, "https://tsukiyo10884.github.io");
            }, 500);
        }, 1500);
    }
    else if (type.includes('gate')) {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, "https://tsukiyo10884.github.io");
        }, 500);
        const no = parseInt(type.replace('gate', ''), 10);
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
                const gateData = await fetchGateStatus(domain, 7, '7sRefちほー4');
                gate.headerImg = gateData.headerImg;
                gate.gateImgHTML = gateData.gateImgHTML;
                gate.mapHTML = gateData.mapHTML;

                gate.key = [];

                for (let i = 1; i < 7; i++) {
                    const gateDoc = await fetchHTML(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=${i}`);
                    gate.key.push({
                        gateImg: gateDoc.querySelectorAll('.ks_block img')[1]?.src,
                        gateAcvImgHTML: gateDoc.querySelector('.ks_acv_img')?.outerHTML
                    });
                }
                break;
            }

            // 希望之門
            case 9: {
                const gateData = await fetchGateStatus(domain, 9, null);
                gate.headerImg = gateData.headerImg;
                gate.gateImgHTML = gateData.gateImgHTML;
                break;
            }

            // 萬花筒
            case 10: {
                const gateData = await fetchGateStatus(domain, 10, null);
                gate.headerImg = gateData.headerImg;
                gate.gateImgHTML = gateData.gateImgHTML;
                gate.key = {};

                const gateRes = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=7`, { credentials: 'include' });
                const gateText = await gateRes.text();
                const gateDoc = new DOMParser().parseFromString(gateText, 'text/html');
                gate.key.gateImg = gateDoc.querySelectorAll('.ks_block img')[1]?.src;
                gate.key.gateAcvImgHTML = gateDoc.querySelector('.ks_acv_img')?.outerHTML;
                break;
            }
        }
        setTimeout(() => {
            childWin.postMessage({ type: "gate" + no, payload: gate }, "https://tsukiyo10884.github.io");
        }, 500);
    }
    // 最近遊玩紀錄
    else if (type === "record") {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, "https://tsukiyo10884.github.io");
        }, 1000);

        const idxs = [...document.querySelectorAll('input[name="idx"]')].map(el => el.value);
        let result = [];
        let count = 0;
        for (const idx of idxs) {
            const recordDoc = await fetchHTML(`${domain}/maimai-mobile/record/playlogDetail/?idx=${idx}`);

            const title = recordDoc.querySelector('.basic_block').childNodes[2].textContent.trim();
            const difficulty = recordDoc.querySelector('.playlog_diff').src.replace('https://maimaidx-eng.com/maimai-mobile/img/diff_', '').replace('.png', '');
            const type = recordDoc.querySelector('.playlog_music_kind_icon')?.src.includes('music_dx.png') ? 'dx' : 'std';

            const songEntry = detailData.songs.find(s => s.songId === title);
            const sheet = songEntry?.sheets.find(s => s.type === type && s.difficulty === difficulty);
            const internalLevelRaw = sheet?.internalLevel ?? sheet?.internalLevelValue;
            const internalLevel = typeof internalLevelRaw === 'string' ? parseFloat(internalLevelRaw) : internalLevelRaw ?? null;

            const data = {
                no: count + 1,
                date: recordDoc.querySelectorAll('.sub_title .v_b')[1].textContent.trim(),
                title: title,
                internalLevel: internalLevel,
                difficulty: difficulty,
                image: recordDoc.querySelector('.music_img').src,
                score: recordDoc.querySelector('.playlog_achievement_txt').textContent.trim(),
                score_new_record: recordDoc.querySelector('.playlog_achievement_newrecord') ? true : false,
                dx_score: recordDoc.querySelector('.white.p_r_5').textContent.trim(),
                dx_score_new_record: recordDoc.querySelector('.playlog_deluxscore_newrecord') ? true : false,
                fast: recordDoc.querySelectorAll('.playlog_fl_block .p_t_5')[0].textContent.trim(),
                late: recordDoc.querySelectorAll('.playlog_fl_block .p_t_5')[1].textContent.trim(),
                rating: recordDoc.querySelectorAll('.rating_block')[1]?.textContent.trim() ?? recordDoc.querySelectorAll('.rating_block')[0]?.textContent.trim(),
                rating_plus: recordDoc.querySelector('.t_r.f_0 span').textContent.trim(),
                notes: {
                    tap: {
                        critical_perfect: recordDoc.querySelectorAll('tr:nth-of-type(2) td')[0].textContent.trim(),
                        perfect: recordDoc.querySelectorAll('tr:nth-of-type(2) td')[1].textContent.trim(),
                        great: recordDoc.querySelectorAll('tr:nth-of-type(2) td')[2].textContent.trim(),
                        good: recordDoc.querySelectorAll('tr:nth-of-type(2) td')[3].textContent.trim(),
                        miss: recordDoc.querySelectorAll('tr:nth-of-type(2) td')[4].textContent.trim()
                    },
                    hold: {
                        critical_perfect: recordDoc.querySelectorAll('tr:nth-of-type(3) td')[0].textContent.trim(),
                        perfect: recordDoc.querySelectorAll('tr:nth-of-type(3) td')[1].textContent.trim(),
                        great: recordDoc.querySelectorAll('tr:nth-of-type(3) td')[2].textContent.trim(),
                        good: recordDoc.querySelectorAll('tr:nth-of-type(3) td')[3].textContent.trim(),
                        miss: recordDoc.querySelectorAll('tr:nth-of-type(3) td')[4].textContent.trim()
                    },
                    slide: {
                        critical_perfect: recordDoc.querySelectorAll('tr:nth-of-type(4) td')[0].textContent.trim(),
                        perfect: recordDoc.querySelectorAll('tr:nth-of-type(4) td')[1].textContent.trim(),
                        great: recordDoc.querySelectorAll('tr:nth-of-type(4) td')[2].textContent.trim(),
                        good: recordDoc.querySelectorAll('tr:nth-of-type(4) td')[3].textContent.trim(),
                        miss: recordDoc.querySelectorAll('tr:nth-of-type(4) td')[4].textContent.trim()
                    },
                    touch: {
                        critical_perfect: recordDoc.querySelectorAll('tr:nth-of-type(5) td')[0].textContent.trim(),
                        perfect: recordDoc.querySelectorAll('tr:nth-of-type(5) td')[1].textContent.trim(),
                        great: recordDoc.querySelectorAll('tr:nth-of-type(5) td')[2].textContent.trim(),
                        good: recordDoc.querySelectorAll('tr:nth-of-type(5) td')[3].textContent.trim(),
                        miss: recordDoc.querySelectorAll('tr:nth-of-type(5) td')[4].textContent.trim()
                    },
                    break: {
                        critical_perfect: recordDoc.querySelectorAll('tr:nth-of-type(6) td')[0].textContent.trim(),
                        perfect: recordDoc.querySelectorAll('tr:nth-of-type(6) td')[1].textContent.trim(),
                        great: recordDoc.querySelectorAll('tr:nth-of-type(6) td')[2].textContent.trim(),
                        good: recordDoc.querySelectorAll('tr:nth-of-type(6) td')[3].textContent.trim(),
                        miss: recordDoc.querySelectorAll('tr:nth-of-type(6) td')[4].textContent.trim()
                    }
                },
                max_combo: recordDoc.querySelectorAll('.col2 .white')[0].textContent.trim(),
                max_sync: recordDoc.querySelectorAll('.col2 .white')[1].textContent.trim()
            };

            result.push(data);

            // 每25頁就延遲一下，避免被鎖連線
            count++;
            if (count % 25 === 0) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        childWin.postMessage({ type: "record", payload: result }, "https://tsukiyo10884.github.io");
    }
    // 計算class
    else if (type === "playerData") {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, "https://tsukiyo10884.github.io");
        }, 1000);

        const playerDataRes = await fetch(`${domain}/maimai-mobile/playerData/`, { credentials: 'include' });
        const playerDataText = await playerDataRes.text();
        const playerDataDoc = new DOMParser().parseFromString(playerDataText, 'text/html');

        const classData = {
            html: playerDataDoc.querySelector('.town_block').outerHTML,
            img: playerDataDoc.querySelector(".w_160.p_15.m_r_10").src,
            text: playerDataDoc.querySelector('.w_160.p_15.m_r_10').src.match(/class_rank_l_(\d{2})/)[1],
            point: playerDataDoc.querySelector('.class_point_txt .f_29.f_b').textContent.trim()
        }

        setTimeout(() => {
            childWin.postMessage({ type: "playerData", payload: classData }, "https://tsukiyo10884.github.io");
        }, 1500);
    }
})();
(async () => {
    const getGateUnlockProgress = async (domain, no) => {
        const gate = {};

        const gateData = await fetchGateStatus(domain, no);
        gate.headerImg = gateData.headerImg;
        gate.gateImgHTML = gateData.gateImgHTML;
        gate.mapHTML = gateData.mapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json')
            .then(res => res.json());
        gate.keySongs = [];
        const gateSongs = gateSongData['gate' + no];
        let count = 0;
        for (const song of gateSongs) {
            const songRes = await fetch(domain + song.url, { credentials: 'include' });
            const songText = await songRes.text();
            const songDoc = new DOMParser().parseFromString(songText, 'text/html');
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

    const getGateRequirements = async (domain, no) => {
        const gate = {};

        const gateData = await fetchGateStatus(domain, no);
        gate.headerImg = gateData.headerImg;
        gate.gateImgHTML = gateData.gateImgHTML;
        gate.mapHTML = gateData.mapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json')
            .then(res => res.json());
        gate.keySongs = gateSongData['gate' + no];

        return gate;
    }

    const fetchGateStatus = async (domain, no) => {
        const gateRes = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=${no}`, { credentials: 'include' });
        const gateText = await gateRes.text();
        const gateDoc = new DOMParser().parseFromString(gateText, 'text/html');
        const headerImg = gateDoc.querySelector('.w_450')?.src;
        const gateImgHTML = gateDoc.querySelectorAll('.ks_block')[0]?.innerHTML;

        const MapRes = await fetch(`${domain}/maimai-mobile/map/`, { credentials: 'include' });
        const MapText = await MapRes.text();
        const MapDoc = new DOMParser().parseFromString(MapText, 'text/html');
        const blocks = Array.from(MapDoc.querySelectorAll('.m_10.m_t_0.f_0'));
        const MapHTML = blocks.find(b => b.textContent.includes('スカイストリートちほー6'))?.outerHTML;
        const mapHTML = MapHTML;

        return { headerImg, gateImgHTML, mapHTML };
    }
    let idx = '';
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
            break;
        }
        // 最近遊玩記錄
        case "/maimai-mobile/record/": {
            childWin = window.open("https://tsukiyo10884.github.io/mai-tools/record.html");
            type = "record";
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
            const difficulties = ["basic", "advanced", "expert", "master", "remaster"];
            const detailData = await fetch('https://dp4p6x0xfi5o9.cloudfront.net/maimai/data.json')
                .then(res => res.json());
            const songVersionData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/international_song_version.json')
                .then(res => res.json());
            const versionData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/version.json')
                .then(res => res.json());

            const user_info = {};
            const songs = [];

            // 自己資訊
            if (idx === '') {
                const homeRes = await fetch(`${domain}/maimai-mobile/home/`, { credentials: 'include' });
                const homeText = await homeRes.text();
                const homeDoc = new DOMParser().parseFromString(homeText, 'text/html');
                user_info.icon = homeDoc.querySelector('.w_112.f_l').src;
                user_info.name = homeDoc.querySelector('.name_block.f_l.f_16').textContent;
                if (user_info.name === "†Ａｙｏｏｏω†") {
                    childWin.postMessage({ type: "special", payload: 'ayo' }, "https://tsukiyo10884.github.io");
                } else if (user_info.name === "ＸＵ☆Ａ　") {
                    childWin.postMessage({ type: "special", payload: 'axun' }, "https://tsukiyo10884.github.io");
                }
                user_info.rating = homeDoc.querySelector('.rating_block').textContent;
                user_info.rating_base = homeDoc.querySelector('.h_30.f_r').src;
                user_info.course_rank = homeDoc.querySelector('.h_35.f_l').src;
                user_info.course_rank_text = homeDoc.querySelector('.h_35.f_l').src.match(/course_rank_(\d{2})/)[1];
                user_info.class_rank = homeDoc.querySelector('.p_l_10.h_35.f_l').src;
                user_info.class_rank_text = homeDoc.querySelector('.p_l_10.h_35.f_l').src.match(/class_rank_s_(\d{2})/)[1];
                user_info.star = homeDoc.querySelector('.p_l_10.f_l.f_14').textContent;
                user_info.user_trophy_block = homeDoc.querySelector('.trophy_block.p_3.t_c.f_0').className;
                user_info.trophy = homeDoc.querySelector('.trophy_inner_block.f_13').textContent;
                for (let i = 0; i < difficulties.length; i++) {
                    childWin.postMessage({ type: "difficulty", payload: difficulties[i] }, "https://tsukiyo10884.github.io");
                    const res = await fetch(`${domain}/maimai-mobile/record/musicGenre/search/?genre=99&diff=${i}`, {
                        credentials: 'include'
                    });
                    const text = await res.text();
                    const doc = new DOMParser().parseFromString(text, 'text/html');
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

            }
            // 好友資訊
            else {
                const homeRes = await fetch(`${domain}/maimai-mobile/friend/friendDetail/?idx=` + idx, { credentials: 'include' });
                const homeText = await homeRes.text();
                const homeDoc = new DOMParser().parseFromString(homeText, 'text/html');
                user_info.icon = homeDoc.querySelector('.w_112.f_l').src;
                user_info.name = homeDoc.querySelector('.name_block.f_l.f_16').textContent;
                user_info.rating = homeDoc.querySelector('.rating_block').textContent;
                user_info.rating_base = homeDoc.querySelector('.h_30.f_r').src;
                user_info.course_rank = homeDoc.querySelector('.h_35.f_l').src;
                user_info.course_rank_text = homeDoc.querySelector('.h_35.f_l').src.match(/course_rank_(\d{2})/)[1];
                user_info.class_rank = homeDoc.querySelector('.p_l_10.h_35.f_l').src;
                user_info.class_rank_text = homeDoc.querySelector('.p_l_10.h_35.f_l').src.match(/class_rank_s_(\d{2})/)[1];
                user_info.star = homeDoc.querySelector('.p_l_10.f_l.f_14').textContent;
                user_info.user_trophy_block = homeDoc.querySelector('.trophy_block.p_3.t_c.f_0').className;
                user_info.trophy = homeDoc.querySelector('.trophy_inner_block.f_13').textContent;

                for (let i = 0; i < difficulties.length; i++) {
                    childWin.postMessage({ type: "difficulty", payload: difficulties[i] }, "https://tsukiyo10884.github.io");
                    const res = await fetch(`${domain}/maimai-mobile/friend/friendGenreVs/battleStart/?genre=99&diff=${i}&idx=${idx}`, {
                        credentials: 'include'
                    });
                    const text = await res.text();
                    const doc = new DOMParser().parseFromString(text, 'text/html');
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

                        const versionInternational = songVersionData[title + "__" + type];
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
            }

            const exportData = {
                user_info,
                songs
            };

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
            // 青門、黑門、紅門
            case 1:
            case 4:
            case 6:
                gate = await getGateUnlockProgress(domain, no);
                break;

            // 白門、紫門、黃門
            case 2:
            case 3:
            case 5:
                gate = await getGateRequirements(domain, no);
                break;

            // 塔
            case 7: {
                const gateData = await fetchGateStatus(domain, 7);
                gate.headerImg = gateData.headerImg;
                gate.gateImgHTML = gateData.gateImgHTML;
                gate.mapHTML = gateData.mapHTML;

                gate.key = [];

                for (let i = 1; i < 7; i++) {
                    const gateRes = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=${i}`, { credentials: 'include' });
                    const gateText = await gateRes.text();
                    const gateDoc = new DOMParser().parseFromString(gateText, 'text/html');
                    gate.key.push({
                        gateImg: gateDoc.querySelectorAll('.ks_block img')[1]?.src,
                        gateAcvImgHTML: gateDoc.querySelector('.ks_acv_img')?.outerHTML
                    });
                }
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
        }, 500);

        const idxs = [...document.querySelectorAll('input[name="idx"]')].map(el => el.value);
        let result = [];
        let count = 0;
        for (const idx of idxs) {
            const homeRes = await fetch(`https://maimaidx-eng.com/maimai-mobile/record/playlogDetail/?idx=${idx}`, { credentials: 'include' });
            const homeText = await homeRes.text();
            const doc = new DOMParser().parseFromString(homeText, 'text/html');

            const data = {
                title: doc.querySelector('.basic_block').childNodes[2].textContent.trim(),
                image: doc.querySelector('.music_img').src,
                score: doc.querySelector('.playlog_achievement_txt').textContent.trim(),
                dx_score: doc.querySelector('.white.p_r_5').textContent.trim(),
                fast: doc.querySelectorAll('.playlog_fl_block .p_t_5')[0].textContent.trim(),
                late: doc.querySelectorAll('.playlog_fl_block .p_t_5')[1].textContent.trim(),
                rating: doc.querySelectorAll('.rating_block')[1]?.textContent.trim() ?? doc.querySelectorAll('.rating_block')[0]?.textContent.trim(),
                rating_plus: doc.querySelector('.t_r.f_0 span').textContent.trim(),
                notes: {
                    tap: {
                        critical_perfect: doc.querySelectorAll('tr:nth-of-type(2) td')[0].textContent.trim(),
                        perfect: doc.querySelectorAll('tr:nth-of-type(2) td')[1].textContent.trim(),
                        great: doc.querySelectorAll('tr:nth-of-type(2) td')[2].textContent.trim(),
                        good: doc.querySelectorAll('tr:nth-of-type(2) td')[3].textContent.trim(),
                        miss: doc.querySelectorAll('tr:nth-of-type(2) td')[4].textContent.trim()
                    },
                    hold: {
                        critical_perfect: doc.querySelectorAll('tr:nth-of-type(3) td')[0].textContent.trim(),
                        perfect: doc.querySelectorAll('tr:nth-of-type(3) td')[1].textContent.trim(),
                        great: doc.querySelectorAll('tr:nth-of-type(3) td')[2].textContent.trim(),
                        good: doc.querySelectorAll('tr:nth-of-type(3) td')[3].textContent.trim(),
                        miss: doc.querySelectorAll('tr:nth-of-type(3) td')[4].textContent.trim()
                    },
                    slide: {
                        critical_perfect: doc.querySelectorAll('tr:nth-of-type(4) td')[0].textContent.trim(),
                        perfect: doc.querySelectorAll('tr:nth-of-type(4) td')[1].textContent.trim(),
                        great: doc.querySelectorAll('tr:nth-of-type(4) td')[2].textContent.trim(),
                        good: doc.querySelectorAll('tr:nth-of-type(4) td')[3].textContent.trim(),
                        miss: doc.querySelectorAll('tr:nth-of-type(4) td')[4].textContent.trim()
                    },
                    touch: {
                        critical_perfect: doc.querySelectorAll('tr:nth-of-type(5) td')[0].textContent.trim(),
                        perfect: doc.querySelectorAll('tr:nth-of-type(5) td')[1].textContent.trim(),
                        great: doc.querySelectorAll('tr:nth-of-type(5) td')[2].textContent.trim(),
                        good: doc.querySelectorAll('tr:nth-of-type(5) td')[3].textContent.trim(),
                        miss: doc.querySelectorAll('tr:nth-of-type(5) td')[4].textContent.trim()
                    },
                    break: {
                        critical_perfect: doc.querySelectorAll('tr:nth-of-type(6) td')[0].textContent.trim(),
                        perfect: doc.querySelectorAll('tr:nth-of-type(6) td')[1].textContent.trim(),
                        great: doc.querySelectorAll('tr:nth-of-type(6) td')[2].textContent.trim(),
                        good: doc.querySelectorAll('tr:nth-of-type(6) td')[3].textContent.trim(),
                        miss: doc.querySelectorAll('tr:nth-of-type(6) td')[4].textContent.trim()
                    }
                },
                max_combo: doc.querySelectorAll('.col2 .white')[0].textContent.trim(),
                max_sync: doc.querySelectorAll('.col2 .white')[1].textContent.trim()
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
})()

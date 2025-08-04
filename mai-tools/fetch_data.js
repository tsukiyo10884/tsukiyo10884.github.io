(async () => {
    let idx = '';
    const url = new URL(window.location.href);
    let domain = '';
    let type = '';
    const gate = {};

    domain = url.origin;

    let childWin = null;
    // 好友資訊
    if (url.pathname === "/maimai-mobile/friend/friendDetail/") {
        idx = url.searchParams.get("idx");
        childWin = window.open("https://tsukiyo10884.github.io/mai-tools/index.html");
        type = "friend";
        setTimeout(() => {
            if (url.origin === "https://maimaidx.jp") {
                childWin.postMessage({ type: "jp", payload: true }, "https://tsukiyo10884.github.io");
            }
        }, 500);
    }
    // 門
    else if (url.pathname === "/maimai-mobile/map/kaleidxScopeDetail/") {
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
    // 自己資訊
    else {
        type = 'main'
        childWin = window.open("https://tsukiyo10884.github.io/mai-tools/index.html");
        setTimeout(() => {
            if (url.origin === "https://maimaidx.jp") {
                childWin.postMessage({ type: "jp", payload: true }, "https://tsukiyo10884.github.io");
            }
        }, 500);
    }

    if (type == 'main' || type == 'friend') {
        const script = document.currentScript;
        setTimeout(() => {
            if (script != null) {
                const srcUrl = new URL(script.src);
                const css = srcUrl.searchParams.get('css');
                if (css !== null && css !== '') {
                    childWin.postMessage({ type: 'init', payload: css }, "https://tsukiyo10884.github.io");
                }
                else {
                    childWin.postMessage({ type: 'init', payload: null }, "https://tsukiyo10884.github.io");
                }
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

            if (idx === '') {
                const homeRes = await fetch(`${domain}/maimai-mobile/home/`, { credentials: 'include' });
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
                    childWin.postMessage({ type: "difficulty", payload: difficulties[i], }, "https://tsukiyo10884.github.io");
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
            } else {
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
                    childWin.postMessage({ type: "difficulty", payload: difficulties[i], }, "https://tsukiyo10884.github.io");
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
    else if (type === 'gate1') {
        setTimeout(() => {
            childWin.postMessage({ type: "gate1_init", payload: null }, "https://tsukiyo10884.github.io");
        }, 500);
        const gate1Res = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=1`, { credentials: 'include' });
        const gate1Text = await gate1Res.text();
        const gate1Doc = new DOMParser().parseFromString(gate1Text, 'text/html');
        gate.headerImg = gate1Doc.querySelector('.w_450')?.src;
        gate.gateImgHTML = gate1Doc.querySelectorAll('.ks_block')[0]?.innerHTML;

        const gate1MapRes = await fetch(`${domain}/maimai-mobile/map/`, { credentials: 'include' });
        const gate1MapText = await gate1MapRes.text();
        const gate1MapDoc = new DOMParser().parseFromString(gate1MapText, 'text/html');
        const blocks = Array.from(gate1MapDoc.querySelectorAll('.m_10.m_t_0.f_0'));
        const gate1MapHTML = blocks.find(b => b.textContent.includes('スカイストリートちほー6'))?.outerHTML;
        gate.mapHTML = gate1MapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json')
            .then(res => res.json());
        gate.keySongs = [];
        const gateSongs = gateSongData.gate1;
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

            // 延遲避免被鎖
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        childWin.postMessage({ type: "gate1", payload: gate }, "https://tsukiyo10884.github.io");
    }
    else if (type === 'gate2') {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, "https://tsukiyo10884.github.io");
        }, 500);
        const gate2Res = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=2`, { credentials: 'include' });
        const gate2Text = await gate2Res.text();
        const gate2Doc = new DOMParser().parseFromString(gate2Text, 'text/html');
        gate.headerImg = gate2Doc.querySelector('.w_450')?.src;
        gate.gateImgHTML = gate2Doc.querySelectorAll('.ks_block')[0]?.innerHTML;

        const gate2MapRes = await fetch(`${domain}/maimai-mobile/map/`, { credentials: 'include' });
        const gate2MapText = await gate2MapRes.text();
        const gate2MapDoc = new DOMParser().parseFromString(gate2MapText, 'text/html');
        const blocks = Array.from(gate2MapDoc.querySelectorAll('.m_10.m_t_0.f_0'));
        const gate2MapHTML = blocks.find(b => b.textContent.includes('天界ちほー8'))?.outerHTML;
        gate.mapHTML = gate2MapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json')
            .then(res => res.json());
        gate.keySongs = gateSongData.gate2;
        setTimeout(() => {
            childWin.postMessage({ type: "gate2", payload: gate }, "https://tsukiyo10884.github.io");
        }, 1000);
    }
    else if (type === 'gate3') {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, "https://tsukiyo10884.github.io");
        }, 500);
        const gate3Res = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=3`, { credentials: 'include' });
        const gate3Text = await gate3Res.text();
        const gate3Doc = new DOMParser().parseFromString(gate3Text, 'text/html');
        gate.headerImg = gate3Doc.querySelector('.w_450')?.src;
        gate.gateImgHTML = gate3Doc.querySelectorAll('.ks_block')[0]?.innerHTML;

        const gate3MapRes = await fetch(`${domain}/maimai-mobile/map/`, { credentials: 'include' });
        const gate3MapText = await gate3MapRes.text();
        const gate3MapDoc = new DOMParser().parseFromString(gate3MapText, 'text/html');
        const blocks = Array.from(gate3MapDoc.querySelectorAll('.m_10.m_t_0.f_0'));
        const gate3MapHTML = blocks.find(b => b.textContent.includes('BLACK ROSEちほー10'))?.outerHTML;
        gate.mapHTML = gate3MapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json')
            .then(res => res.json());
        gate.keySongs = gateSongData.gate3;
        setTimeout(() => {
            childWin.postMessage({ type: "gate3", payload: gate }, "https://tsukiyo10884.github.io");
        }, 1000);
    }
    else if (type === 'gate4') {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, "https://tsukiyo10884.github.io");
        }, 500);
        const gate4Res = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=4`, { credentials: 'include' });
        const gate4Text = await gate4Res.text();
        const gate4Doc = new DOMParser().parseFromString(gate4Text, 'text/html');
        gate.headerImg = gate4Doc.querySelector('.w_450')?.src;
        gate.gateImgHTML = gate4Doc.querySelectorAll('.ks_block')[0]?.innerHTML;

        const gate4MapRes = await fetch(`${domain}/maimai-mobile/map/`, { credentials: 'include' });
        const gate4MapText = await gate4MapRes.text();
        const gate4MapDoc = new DOMParser().parseFromString(gate4MapText, 'text/html');
        const blocks = Array.from(gate4MapDoc.querySelectorAll('.m_10.m_t_0.f_0'));
        const gate4MapHTML = blocks.find(b => b.textContent.includes('メトロポリスちほー9'))?.outerHTML;
        gate.mapHTML = gate4MapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json')
            .then(res => res.json());
        gate.keySongs = [];
        const gateSongs = gateSongData.gate4;
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
        }
        childWin.postMessage({ type: "gate4", payload: gate }, "https://tsukiyo10884.github.io");
    }
    else if (type === 'gate5') {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, "https://tsukiyo10884.github.io");
        }, 500);
        const gate5Res = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=5`, { credentials: 'include' });
        const gate5Text = await gate5Res.text();
        const gate5Doc = new DOMParser().parseFromString(gate5Text, 'text/html');
        gate.headerImg = gate5Doc.querySelector('.w_450')?.src;
        gate.gateImgHTML = gate5Doc.querySelectorAll('.ks_block')[0]?.innerHTML;

        const gate5MapRes = await fetch(`${domain}/maimai-mobile/map/`, { credentials: 'include' });
        const gate5MapText = await gate5MapRes.text();
        const gate5MapDoc = new DOMParser().parseFromString(gate5MapText, 'text/html');
        const blocks = Array.from(gate5MapDoc.querySelectorAll('.m_10.m_t_0.f_0'));
        const gate5MapHTML = blocks.find(b => b.textContent.includes('なないろちほー'))?.outerHTML;
        gate.mapHTML = gate5MapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json')
            .then(res => res.json());
        gate.keySongs = gateSongData.gate5;
        setTimeout(() => {
            childWin.postMessage({ type: "gate5", payload: gate }, "https://tsukiyo10884.github.io");
        }, 1000);
    }
    else if (type === 'gate6') {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, "https://tsukiyo10884.github.io");
        }, 500);
        const gate6Res = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=6`, { credentials: 'include' });
        const gate6Text = await gate6Res.text();
        const gate6Doc = new DOMParser().parseFromString(gate6Text, 'text/html');
        gate.headerImg = gate6Doc.querySelector('.w_450')?.src;
        gate.gateImgHTML = gate6Doc.querySelectorAll('.ks_block')[0]?.innerHTML;

        const gate6MapRes = await fetch(`${domain}/maimai-mobile/map/`, { credentials: 'include' });
        const gate6MapText = await gate6MapRes.text();
        const gate6MapDoc = new DOMParser().parseFromString(gate6MapText, 'text/html');
        const blocks = Array.from(gate6MapDoc.querySelectorAll('.m_10.m_t_0.f_0'));
        const gate6MapHTML = blocks.find(b => b.textContent.includes('ドラゴンちほー4'))?.outerHTML;
        gate.mapHTML = gate6MapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json')
            .then(res => res.json());
        gate.keySongs = [];
        const gateSongs = gateSongData.gate6;
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

            gate.keySongs.push({ title: song.title, type: song.type, songLastPlayedDate });
        }
        childWin.postMessage({ type: "gate6", payload: gate }, "https://tsukiyo10884.github.io");
    }
    else if (type === 'gate7') {
        setTimeout(() => {
            childWin.postMessage({ type: "init", payload: null }, "https://tsukiyo10884.github.io");
        }, 500);
        const gate7Res = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=7`, { credentials: 'include' });
        const gate7Text = await gate7Res.text();
        const gate7Doc = new DOMParser().parseFromString(gate7Text, 'text/html');
        gate.headerImg = gate7Doc.querySelector('.w_450')?.src;
        gate.gateImgHTML = gate7Doc.querySelectorAll('.ks_block')[0]?.innerHTML;

        const gate7MapRes = await fetch(`${domain}/maimai-mobile/map/`, { credentials: 'include' });
        const gate7MapText = await gate7MapRes.text();
        const gate7MapDoc = new DOMParser().parseFromString(gate7MapText, 'text/html');
        const blocks = Array.from(gate7MapDoc.querySelectorAll('.m_10.m_t_0.f_0'));
        const gate7MapHTML = blocks.find(b => b.textContent.includes('7sRefちほー4'))?.outerHTML;
        gate.mapHTML = gate7MapHTML;

        gate.key=[];

        for (let i = 1; i < 7; i++) {
            const gateRes = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=${i}`, { credentials: 'include' });
            const gateText = await gateRes.text();
            const gateDoc = new DOMParser().parseFromString(gateText, 'text/html');
            gate.key.push({
                headerImg: gateDoc.querySelector('.w_450')?.src,
                gateImgHTML: gateDoc.querySelectorAll('.ks_block')[0]?.innerHTML
            });
        }

        childWin.postMessage({ type: "gate7", payload: gate }, "https://tsukiyo10884.github.io");
    }
})()
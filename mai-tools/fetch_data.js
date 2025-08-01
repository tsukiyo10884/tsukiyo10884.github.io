(async () => {
    let idx = '';
    const url = new URL(window.location.href);
    let domain = '';
    let type = '';

    domain = url.origin;
    setTimeout(() => {
        if (url.origin === "https://maimaidx.jp") {
            childWin.postMessage({ type: "jp", payload: true }, "https://tsukiyo10884.github.io");
        }
    }, 500);

    let childWin = null;
    // 好友資訊
    if (url.pathname === "/maimai-mobile/friend/friendDetail/") {
        idx = url.searchParams.get("idx");
        childWin = window.open("https://tsukiyo10884.github.io/mai-tools/index.html");
        type = "friend";
    }
    // 青門
    else if (url.pathname + url.search === "/maimai-mobile/map/kaleidxScopeDetail/?gate=1") {
        type = "gate1";
        childWin = window.open("https://tsukiyo10884.github.io/mai-tools/gate.html");
    }
    // 白門
    else if (url.pathname + url.search === "/maimai-mobile/map/kaleidxScopeDetail/?gate=2") {
        type = "gate2";
        childWin = window.open("https://tsukiyo10884.github.io/mai-tools/gate.html");
    }
    // 自己資訊
    else {
        type = 'main'
        childWin = window.open("https://tsukiyo10884.github.io/mai-tools/index.html");
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
        const gate1 = {};
        gate1.headerImg = gate1Doc.querySelector('.w_450')?.src;
        gate1.gateImgHTML = gate1Doc.querySelectorAll('.ks_block')[0]?.innerHTML;

        const gate1MapRes = await fetch(`${domain}/maimai-mobile/map/`, { credentials: 'include' });
        const gate1MapText = await gate1MapRes.text();
        const gate1MapDoc = new DOMParser().parseFromString(gate1MapText, 'text/html');
        const blocks = Array.from(gate1MapDoc.querySelectorAll('.m_10.m_t_0.f_0'));
        const gate1MapHTML = blocks.find(b => b.textContent.includes('スカイストリートちほー6'))?.outerHTML;
        gate1.mapHTML = gate1MapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json')
            .then(res => res.json());
        gate1.keySongs = [];
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

            gate1.keySongs.push({ title: song.title, songLastPlayedDate });

            // 延遲避免被鎖
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        childWin.postMessage({ type: "gate1", payload: gate1 }, "https://tsukiyo10884.github.io");
    }
    else if (type === 'gate2') {
        setTimeout(() => {
            childWin.postMessage({ type: "gate2_init", payload: null }, "https://tsukiyo10884.github.io");
        }, 500);
        const gate2Res = await fetch(`${domain}/maimai-mobile/map/kaleidxScopeDetail/?gate=1`, { credentials: 'include' });
        const gate2Text = await gate2Res.text();
        const gate2Doc = new DOMParser().parseFromString(gate2Text, 'text/html');
        const gate2 = {};
        gate2.headerImg = gate2Doc.querySelector('.w_450')?.src;
        gate2.gateImgHTML = gate2Doc.querySelectorAll('.ks_block')[0]?.innerHTML;

        const gate2MapRes = await fetch(`${domain}/maimai-mobile/map/`, { credentials: 'include' });
        const gate2MapText = await gate2MapRes.text();
        const gate2MapDoc = new DOMParser().parseFromString(gate2MapText, 'text/html');
        const blocks = Array.from(gate2MapDoc.querySelectorAll('.m_10.m_t_0.f_0'));
        const gate2MapHTML = blocks.find(b => b.textContent.includes('スカイストリートちほー6'))?.outerHTML;
        gate2.mapHTML = gate2MapHTML;

        const gateSongData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/gate.json')
            .then(res => res.json());
        gate2.keySongs = gateSongData.gate2;
        childWin.postMessage({ type: "gate2", payload: gate2 }, "https://tsukiyo10884.github.io");
    }
})()
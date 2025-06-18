(async () => {
    const childWin = window.open("https://tsukiyo10884.github.io/mai-tools/index.html");
    childWin.postMessage({
        type: null,
        payload: null,
    }, "https://tsukiyo10884.github.io");

    let idx = '';
    const url = new URL(window.location.href);
    if (
        url.origin === "https://maimaidx-eng.com" &&
        url.pathname === "/maimai-mobile/friend/friendDetail/"
    ) {
        idx = url.searchParams.get("idx");
    }

    const difficulties = ["basic", "advanced", "expert", "master", "remaster"];
    const detailData = await fetch('https://dp4p6x0xfi5o9.cloudfront.net/maimai/data.json')
        .then(res => res.json());
    const songVersionData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/international_song_version.json')
        .then(res => res.json());
    const versionData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/version.json')
        .then(res => res.json());

    const homeRes = await fetch('https://maimaidx-eng.com/maimai-mobile/home/', { credentials: 'include' });
    const homeText = await homeRes.text();
    const homeDoc = new DOMParser().parseFromString(homeText, 'text/html');
    const user_info = {};
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

    const songs = [];

    if (idx === '') {
        for (let i = 0; i < difficulties.length; i++) {
            childWin.postMessage({
                type: "difficulty",
                payload: difficulties[i],
            }, "https://tsukiyo10884.github.io");
            const res = await fetch(`https://maimaidx-eng.com/maimai-mobile/record/musicGenre/search/?genre=99&diff=${i}`, {
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

                let version_international = songVersionData[title + "__" + type];
                if (version_international === undefined) {
                    version_international = versionData[versionData.length - 1].versionName;
                }
                if (version_international.includes('でらっくす')) {
                    version_international = version_international.replace('maimaiでらっくす', 'でらっくす');
                }
                if (version_international.includes('Splash')) {
                    version_international = version_international.replace('Splash', 'スプラッシュ');
                }
                const version_japan = sheet?.version;

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
                    type, title, score, difficulty: difficulties[i], version_international, version_japan,
                    internalLevel, image, ...flags
                });
            });
        }
    } else {
        for (let i = 0; i < difficulties.length; i++) {
            childWin.postMessage({
                type: "difficulty",
                payload: difficulties[i],
            }, "https://tsukiyo10884.github.io");
            const res = await fetch(`https://maimaidx-eng.com/maimai-mobile/friend/friendGenreVs/battleStart/?genre=99&diff=${i}&idx=${idx}`, {
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

                const version_international = songVersionData[title + "__" + type];
                const version_japan = sheet?.version;

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
                    type, title, score, difficulty: difficulties[i], version_international, version_japan,
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
        childWin.postMessage({
            type: "result",
            payload: exportData,
        }, "https://tsukiyo10884.github.io");
        childWin.postMessage(exportData, "https://tsukiyo10884.github.io");
    }, 500);

})()
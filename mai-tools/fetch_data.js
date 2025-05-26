(async () => {
    const childWin = window.open("https://tsukiyo10884.github.io/mai-tools/index.html");

    // 取得玩家主頁資料
    const homeRes = await fetch('https://maimaidx-eng.com/maimai-mobile/home/', { credentials: 'include' });
    const homeText = await homeRes.text();
    const homeDoc = new DOMParser().parseFromString(homeText, 'text/html');

    const user = homeDoc.querySelector('.basic_block.p_10.f_0').outerHTML;

    // 取得詳細譜面資料
    const detailData = await fetch('https://dp4p6x0xfi5o9.cloudfront.net/maimai/data.json')
        .then(res => res.json());

    const difficulties = ["basic", "advanced", "expert", "master", "remaster"];
    const songs = [];

    // 依照難度抓取每首歌的成績
    for (let i = 0; i < difficulties.length; i++) {
        childWin.postMessage({
            type: "difficulty",
            payload: i,
        }, "https://tsukiyo10884.github.io");
        const res = await fetch(`https://maimaidx-eng.com/maimai-mobile/record/musicGenre/search/?genre=99&diff=${difficulties[i]}`, {
            credentials: 'include'
        });
        const text = await res.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const blocks = doc.querySelectorAll('div.w_450.m_15.p_r.f_0');

        blocks.forEach(block => {
            const type = block.querySelector('.music_kind_icon')?.src.includes('music_dx.png') ? 'dx' : 'std';
            const title = block.querySelector('.music_name_block')?.textContent.trim() || "";

            const score = parseFloat(
                block.querySelector('.music_score_block.w_112')?.textContent.trim().replace('%', '') || "0"
            ).toFixed(4) + "%";

            const songEntry = detailData.songs.find(s => s.songId === title);
            const sheet = songEntry?.sheets.find(s => s.type === type && s.difficulty === difficulties[i]);

            const internalLevelRaw = sheet?.internalLevel ?? sheet?.internalLevelValue;
            const internalLevel = typeof internalLevelRaw === 'string' ? parseFloat(internalLevelRaw) : internalLevelRaw ?? null;
            const image = `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`;
            const version = songEntry?.version;

            const iconSrc = block.querySelector('.h_30.f_r')?.src ?? '';
            const flags = {
                sync: iconSrc.includes('music_icon_sync'),
                ap: iconSrc.includes('music_icon_ap'),
                app: iconSrc.includes('music_icon_app'),
                fs: iconSrc.includes('music_icon_fs'),
                fsp: iconSrc.includes('music_icon_fsp'),
                fc: iconSrc.includes('music_icon_fc'),
                fcp: iconSrc.includes('music_icon_fcp'),
                fdx: iconSrc.includes('music_icon_fdx'),
                fdxp: iconSrc.includes('music_icon_fdxp'),
            };

            songs.push({
                type, title, score, difficulty: difficulties[i], version,
                internalLevel, image, ...flags
            });
        });
    }

    // 取得 Rating 對象資料
    const ratingRes = await fetch('https://maimaidx-eng.com/maimai-mobile/home/ratingTargetMusic/', {
        credentials: 'include'
    });
    const ratingText = await ratingRes.text();
    const ratingDoc = new DOMParser().parseFromString(ratingText, 'text/html');

    function getDivsBetweenHeaders(startText, endText) {
        const headers = [...ratingDoc.querySelectorAll('.screw_block')];
        const startIdx = headers.findIndex(h => h.textContent.trim() === startText);
        const endIdx = headers.findIndex(h => h.textContent.trim() === endText);
        if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) return [];

        const result = [];
        let el = headers[startIdx].nextElementSibling;
        while (el && el !== headers[endIdx]) {
            result.push(el);
            el = el.nextElementSibling;
        }
        return result;
    }

    function parseRatingBlocks(blocks) {
        return blocks.map(div => {
            const difficulty = div.querySelector('img.h_20.f_l')?.src.match(/diff_(\w+)\.png/)?.[1] || '';
            const type = div.querySelector('img.music_kind_icon.f_r')?.src.includes('music_dx.png') ? 'dx' : 'std';
            const title = div.querySelector('.music_name_block')?.textContent.trim() || '';
            const score = div.querySelector('.music_score_block')?.textContent.trim() || '';
            return { difficulty, type, title, score };
        });
    }

    function enrichRatingBlocks(blocks) {
        return blocks.map(({ difficulty, type, title, score }) => {
            const songEntry = detailData.songs.find(e => e.title === title);
            const sheet = songEntry?.sheets.find(s => s.type === type && s.difficulty === difficulty);
            const internalLevelRaw = sheet?.internalLevel ?? sheet?.internalLevelValue;
            const internalLevel = typeof internalLevelRaw === 'string' ? parseFloat(internalLevelRaw) : internalLevelRaw ?? null;
            const image = `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`;
            const version = songEntry?.version;
            return { type, title, score, difficulty, version, internalLevel, image };
        });
    }

    const ratingNew = enrichRatingBlocks(parseRatingBlocks(getDivsBetweenHeaders(
        "Songs for Rating(New)", "Songs for Rating(Others)"
    )));
    const ratingOthers = enrichRatingBlocks(parseRatingBlocks(getDivsBetweenHeaders(
        "Songs for Rating(Others)", "Songs for Rating Selection(New)"
    )));

    // 組合所有資料並傳送
    const exportData = {
        user,
        ratingSongList: {
            rating_new: ratingNew,
            rating_others: ratingOthers
        },
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
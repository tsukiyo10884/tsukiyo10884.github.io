javascript: (async () => {

    const childWin = window.open("https://tsukiyo10884.github.io/mai-tools/index.html");

    // User Profile
    const homeRes = await fetch('https://maimaidx-eng.com/maimai-mobile/home/', {
        credentials: 'include'
    });
    const homeText = await homeRes.text();
    const homeDoc = new DOMParser().parseFromString(homeText, 'text/html');

    const userBlock = homeDoc.querySelector('.see_through_block.m_15.m_t_10.p_10.p_r.t_l.f_0');

    const user = {
        icon: userBlock.querySelector('.w_112.f_l')?.getAttribute('src') ?? '',
        title: userBlock.querySelector('.trophy_block')?.outerHTML ?? '',
        name: userBlock.querySelector('.name_block')?.outerHTML ?? '',
        rating: userBlock.querySelector('.f_r.t_r.f_0')?.outerHTML ?? '',
        rank: userBlock.querySelector('.h_35.f_l')?.getAttribute('src') ?? '',
        class: userBlock.querySelector('.p_l_10.h_35.f_l')?.getAttribute('src') ?? '',
        star: userBlock.querySelector('.p_l_10.f_l.f_14')?.outerHTML ?? ''
    };

    // 稱號(title) 過長則省略
    let titleDiv = userBlock.querySelector('.trophy_block');
    if (titleDiv) {
        const textContainer = titleDiv.querySelector('.trophy_inner_block');
        const text = textContainer?.textContent.trim() ?? '';
        if (text.length > 20) {
            const truncated = text.slice(0, 19) + '…';
            textContainer.textContent = truncated;
        }
        user.title = titleDiv.outerHTML;
    }

    // 撈取包含定數的data
    const officialData = await fetch('https://dp4p6x0xfi5o9.cloudfront.net/maimai/data.json')
        .then(res => res.json());

    //抓各難度資料
    const diffMap = ["basic", "advanced", "expert", "master", "remaster"];
    const result = [];
    for (let i = 0; i <= 4; i++) {
        const res = await fetch(`https://maimaidx-eng.com/maimai-mobile/record/musicGenre/search/?genre=99&diff=${i}`, {
            credentials: 'include'
        });
        const text = await res.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const blocks = doc.querySelectorAll('div.w_450.m_15.p_r.f_0');

        blocks.forEach(block => {
            const typeImg = block.querySelector('.music_kind_icon')?.getAttribute('src') || "";
            const type = typeImg.includes('music_dx.png') ? 'dx' : 'std';
            const title = block.querySelector('.music_name_block')?.textContent.trim() || "";
            const scoreText = block.querySelector('.music_score_block.w_112')?.textContent.trim().replace('%', '') || "0.0000";
            const score = parseFloat(scoreText).toFixed(4) + "%";
            const difficulty = diffMap[i];
            const songEntry = officialData.songs.find(e => e.title === title);
            const sheet = songEntry?.sheets.find(s => s.type === type && s.difficulty === difficulty);
            const version = songEntry?.version;
            const rawLevel = sheet?.internalLevel ?? sheet?.internalLevelValue;
            const internalLevel = typeof rawLevel === 'string' ? parseFloat(rawLevel) : rawLevel ?? null;
            const image = `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/` + songEntry?.imageName;
            const sync = block.querySelector('.h_30.f_r')?.src.includes('music_icon_sync') ?? false;
            const ap = block.querySelector('.h_30.f_r')?.src.includes('music_icon_ap') ?? false;
            const app = block.querySelector('.h_30.f_r')?.src.includes('music_icon_app') ?? false;
            const fs = block.querySelector('.h_30.f_r')?.src.includes('music_icon_fs') ?? false;
            const fsp = block.querySelector('.h_30.f_r')?.src.includes('music_icon_fsp') ?? false;
            const fc = block.querySelector('.h_30.f_r')?.src.includes('music_icon_fc') ?? false;
            const fcp = block.querySelector('.h_30.f_r')?.src.includes('music_icon_fcp') ?? false;
            const fdx = block.querySelector('.h_30.f_r')?.src.includes('music_icon_fdx') ?? false;

            result.push({ type, title, score, difficulty, version, internalLevel, image, sync, ap, app, fs, fsp, fc, fcp, fdx });
        });
    }
    // 撈取 rating target 頁面資料
    const ratingRes = await fetch('https://maimaidx-eng.com/maimai-mobile/home/ratingTargetMusic/', {
        credentials: 'include'
    });
    const ratingSongList = { rating_new: [], rating_others: [] };
    let mode = null;

    const ratingText = await ratingRes.text();
    const ratingDoc = new DOMParser().parseFromString(ratingText, 'text/html');
    const elements = ratingDoc.querySelectorAll('div');

    elements.forEach(el => {
        const text = el.textContent.trim();

        if (text === 'Songs for Rating(New)') {
            mode = 'rating_new';
        } else if (text === 'Songs for Rating(Others)') {
            mode = 'rating_others';
        } else if (text === 'Songs for Rating Selection(New)') {
            mode = null;
        } else if (el.classList.contains('music_name_block') && mode) {
            const songEntry = result.find(e => e.title === el.innerHTML);
            ratingSongList[mode].push(songEntry);
        }

    });

    const exportData = {
        user,
        ratingSongList,
        songs: result
    };
    setTimeout(() => {
        childWin.postMessage(exportData, "https://tsukiyo10884.github.io");
    }, 500);
})();


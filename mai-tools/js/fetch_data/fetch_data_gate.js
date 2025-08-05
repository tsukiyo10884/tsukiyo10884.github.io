
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
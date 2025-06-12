(async () => {
    const versions = [
        "maimai", "maimai PLUS", "GreeN", "GreeN PLUS",
        "ORANGE", "ORANGE PLUS", "PiNK", "PiNK PLUS",
        "MURASAKi", "MURASAKi PLUS", "MiLK", "MiLK PLUS",
        "FiNALE", "でらっくす", "でらっくす PLUS", "スプラッシュ",
        "スプラッシュ PLUS", "UNiVERSE", "UNiVERSE PLUS",
        "FESTiVAL", "FESTiVAL PLUS", "BUDDiES",
        "BUDDiES PLUS", "PRiSM", "PRiSM PLUS"
    ];

    const titleTypeToVersion = {};

    for (let i = 0; i < versions.length; i++) {
        const res = await fetch(`https://maimaidx-eng.com/maimai-mobile/record/musicVersion/search/?version=${i}&diff=3`, {
            credentials: 'include'
        });
        const text = await res.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');

        if (versions[i] !== doc.querySelector('.screw_block.m_15.f_15.p_s').textContent) {
            console.log(`version名稱不一致: ${versions[i]} !== ${doc.querySelector('.screw_block.m_15.f_15.p_s').textContent}`);
            continue;
        }

        const blocks = doc.querySelectorAll('.music_master_score_back.pointer.w_450.m_15.p_3.f_0');

        blocks.forEach(block => {
            const title = block.querySelector('.music_name_block.t_l.f_13.break')?.textContent.trim();
            const kindImg = block.querySelector('.music_kind_icon.f_r')?.getAttribute('src') || "";
            const type = kindImg.includes('music_dx') ? 'dx' : 'std';

            if (title) {
                const key = `${title}__${type}`;
                if (!(key in titleTypeToVersion)) {
                    titleTypeToVersion[key] = versions[i];
                }
            }
        });

        console.log(`Fetched version ${i}: ${versions[i]}, songs: ${blocks.length}`);
    }

    const blob = new Blob([JSON.stringify(titleTypeToVersion, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'maimai_title_type_to_version.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
})();

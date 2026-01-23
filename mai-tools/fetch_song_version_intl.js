(async () => {
    const siteOrigin = new URL(document.currentScript.src).origin;
    const versions = ["maimai", "maimai PLUS"].concat((await fetch(`${siteOrigin}/mai-tools/json/version.json`).then(res => res.json())).map(function (e) { return e.versionName }).slice(1));

    const titleTypeToVersion = {};

    for (let i = 0; i < versions.length; i++) {
        const res = await fetch(`https://maimaidx-eng.com/maimai-mobile/record/musicVersion/search/?version=${i}&diff=3`, {
            credentials: 'include'
        });
        const text = await res.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');

        if (versions[i] !== doc.querySelector('.screw_block.m_15.f_15.p_s').textContent) {
            continue;
        }

        const blocks = doc.querySelectorAll('.music_master_score_back.pointer.w_450.m_15.p_3.f_0');

        blocks.forEach(block => {
            const title = block.querySelector('.music_name_block.t_l.f_13.break')?.textContent.trim() || "　";
            const kindImg = block.querySelector('.music_kind_icon.f_r')?.getAttribute('src') || "";
            const type = kindImg.includes('music_dx') ? 'dx' : 'std';

            if (title) {
                let key = `${title}__${type}`;
                if (title === "Bad Apple!! feat nomico") {
                    key = "Bad Apple!! feat.nomico__std";
                }
                if (!(key in titleTypeToVersion)) {
                    titleTypeToVersion[key] = versions[i];
                }
            }
        });
    }

    console.log(titleTypeToVersion);
})();

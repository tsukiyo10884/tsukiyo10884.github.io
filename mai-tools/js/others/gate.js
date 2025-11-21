const showGateData = (data) => {
    if (data.type === 'gate1') {
        const gate = data.payload;
        const res = []
        gate.keySongs.forEach(song => {
            const songEntry = detailData.songs.find(s => s.songId === song.title);
            res.push(createKeySongCard({
                title: song.title,
                type: 'dx',
                image: `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`
            }, {
                isCompleted: song.songLastPlayedDate > (data.domain === 'jp' ? '2024/09/12' : '2025/01/16')
            }));
        });

        const headerImg = gate.headerImg ? `<div class="d-flex justify-content-center"><img src="${gate.headerImg}" alt="Header Image"></div>` : '';
        $('#gate').html([headerImg, gate.gateImgHTML].join(''));
        $('#map').html([`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Gate</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="d-flex justify-content-center mb-4">青門發現條件：走完地圖「スカイストリートちほー6」</div>
            `, gate.mapHTML].join(''));
        $('#song-table').html(`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Key</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">青鑰匙獲得條件：在青門開放後(日版:2024年9月12日 | 國際版:2025年1月16日)，打過所有青春區域的歌曲<br/>(任意難度、不限成績、可跳過，不可宴譜面、不可用段位認定模式)</div>
                <div id="level-song-grid" class="square-song-grid col-12 row ms-0">
                    ${res.join('')}
                </div>
            ` );
    }
    else if (data.type === 'gate2') {
        const gate = data.payload;
        const res = []
        gate.keySongs.forEach(song => {
            const songEntry = detailData.songs.find(s => s.songId === song.title);
            res.push(createKeySongCard({
                title: song.title,
                type: 'dx',
                image: `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`
            }));
        });

        const headerImg = gate.headerImg ? `<div class="d-flex justify-content-center"><img src="${gate.headerImg}" alt="Header Image"></div>` : '';
        $('#gate').html([headerImg, gate.gateImgHTML].join(''));
        $('#map').html([`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Gate</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="d-flex justify-content-center mb-4">白門發現條件：走完地圖「天界ちほー8」</div>
            `, gate.mapHTML].join(''));
        $('#song-table').html(`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Key</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">白鑰匙獲得條件：設定底板為「Latent Kingdom」的狀態下，一道內遊玩作曲家大国奏音的歌曲，該道內不可重複選曲，雙人時需遊玩4曲<br/>(任意難度、不限成績、可跳過，不可宴譜面、不可用段位認定模式)</div>
                <div id="level-song-grid" class="square-song-grid col-12 row ms-0">
                    ${res.join('')}
                </div>
            ` );

    }
    else if (data.type === 'gate3') {
        const gate = data.payload;
        const res = []
        gate.keySongs.forEach(song => {
            const songEntry = detailData.songs.find(s => s.songId === song.title);
            res.push(createKeySongCard({
                title: song.title,
                type: song.type,
                image: `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`
            }));
        });

        const headerImg = gate.headerImg ? `<div class="d-flex justify-content-center"><img src="${gate.headerImg}" alt="Header Image"></div>` : '';
        $('#gate').html([headerImg, gate.gateImgHTML].join(''));
        $('#map').html([`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Gate</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="d-flex justify-content-center mb-4">紫門發現條件：走完地圖「BLACK ROSEちほー10」</div>
            `, gate.mapHTML].join(''));
        $('#song-table').html(`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Key</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">紫鑰匙(國際版)獲得條件：<br>設定アウル（BLACK ROSEちほー)或アウル（BLACK ROSEちほー4)作為隊長的狀態下，一道內遊玩黑薔薇或言葉系列歌曲，該道內不可重複選曲，雙人時需遊玩4曲<br/>(任意難度、不限成績、可跳過，不可宴譜面、不可用段位認定模式)</div>
                <div id="level-song-grid" class="square-song-grid col-12 row ms-0">
                    ${res.join('')}
                </div>
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Key(JP)</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">紫鑰匙(日版)獲得條件：
                    <table style="width: 100%; border-collapse: collapse; border-color: rgb(255, 255, 255); height: 192px;"><tbody><tr style="height: 21px;"><td style="border-color: rgb(255, 255, 255); height: 21px; width: 5%; vertical-align: top;">1.</td> <td style="border-color: rgb(255, 255, 255); height: 21px; width: 95%; vertical-align: top;"><a href="https://maimai.sega.jp/kotonoha/" target="_blank" rel="noopener">「言ノ葉Project」公式サイト</a> → <a href="https://maimai.sega.jp/kotonoha/special/" target="_blank" rel="noopener">「SPECIAL」ページ</a> にアクセスする。</td></tr> <tr style="height: 43px;"><td style="border-color: rgb(255, 255, 255); height: 43px; width: 5%; vertical-align: top;">2.</td> <td style="border-color: rgb(255, 255, 255); height: 43px; width: 95%; vertical-align: top;">「インスト音源」の項目に追加されている隠し音源のモールス信号を解読し、<br> <span style="color: rgb(0, 0, 0);">「change spec to factor」</span>というヒントを得る。</td></tr> <tr style="height: 43px;"><td style="border-color: rgb(255, 255, 255); height: 43px; width: 5%; vertical-align: top;">3.</td> <td style="border-color: rgb(255, 255, 255); height: 43px; width: 95%; vertical-align: top;">&nbsp;上記のヒントから、「SPECIAL」ページのURLに含まれている、<br>
                    「<span style="color: rgb(255, 0, 0);">spec</span>ial」を「<span style="color: rgb(255, 0, 0);">factor</span>ial」に変更しアクセスすると、<a href="https://maimai.sega.jp/kotonoha/factorial/" target="_blank" rel="noopener">隠しページ</a>が表示される。</td></tr> <tr style="height: 64px;"><td style="border-color: rgb(255, 255, 255); height: 64px; width: 5%; vertical-align: top;">4.</td> <td style="border-color: rgb(255, 255, 255); height: 64px; width: 95%; vertical-align: top;">&nbsp;隠しページのヒュド・ルーが持つ「XXI（21）」のカードと、<br>
                    URLに含まれる「factorial（階乗）」をヒントに、<br>
                    「21の階乗」を計算して、20ケタの数字<span style="color: rgb(255, 0, 0);">「51090942171709440000」<span style="color: rgb(0, 0, 0);">を得る。</span></span></td></tr> <tr style="height: 21px;"><td style="border-color: rgb(255, 255, 255); height: 21px; width: 5%; vertical-align: top;">5.</td> <td style="border-color: rgb(255, 255, 255); height: 21px; width: 95%; vertical-align: top;"><a href="https://maimaidx.jp/" target="_blank" rel="noopener">maimaiでらっくすNET</a> の「シリアルコード」のページに、上記の数字を入力する。</td></tr></tbody></table>
                </div>
            ` );

    }
    else if (data.type === 'gate4') {
        const gate = data.payload;
        const res = []
        gate.keySongs.forEach(song => {
            const songEntry = detailData.songs.find(s => s.songId === song.title);
            res.push(createKeySongCard({
                title: song.title,
                type: 'dx',
                image: `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`
            }, {
                isCompleted: song.songLastPlayedDate > '2025/02/27'
            }));
        });

        const headerImg = gate.headerImg ? `<div class="d-flex justify-content-center"><img src="${gate.headerImg}" alt="Header Image"></div>` : '';
        $('#gate').html([headerImg, gate.gateImgHTML].join(''));
        $('#map').html([`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Gate</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="d-flex justify-content-center mb-4">黑門發現條件：走完地圖「メトロポリスちほー9」</div>
            `, gate.mapHTML].join(''));
        $('#song-table').html(`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Key</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">黑鑰匙獲得條件：在黑門開放後(日版&國際版:2025年2月27日)，打過所有「KING of Performai 2019」～「KING of Performai The 6th」的maimai でらっくす部門中，線上預選(包含新增Re:MASTER譜面)、決賽課題(不含第6屆)及表演賽歌曲
                    <br/>(任意難度、不限成績、可跳過，不可宴譜面、不可用段位認定模式)</div>
                <div id="level-song-grid" class="square-song-grid col-12 row ms-0">
                    ${res.join('')}
                </div>
            ` );
    }
    else if (data.type === 'gate5') {
        const gate = data.payload;
        const res = []
        gate.keySongs.forEach(song => {
            const songEntry = detailData.songs.find(s => s.songId === song.title);
            res.push(createKeySongCard({
                title: song.title,
                type: 'dx',
                image: `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`
            }));
        });

        const headerImg = gate.headerImg ? `<div class="d-flex justify-content-center"><img src="${gate.headerImg}" alt="Header Image"></div>` : '';
        $('#gate').html([headerImg, gate.gateImgHTML].join(''));
        $('#map').html([`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Gate</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="d-flex justify-content-center mb-4">黃門發現條件：走完地圖「なないろちほー」</div>
            `, gate.mapHTML].join(''));
        $('#song-table').html(`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Key</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">黃鑰匙獲得條件：使用隨機選曲功能抽中「maimai でらっくす」至「maimai でらっくす PRiSM PLUS」之間任一版本的主題曲並遊玩一首(可在我的最愛抽)<br/>(任意難度、不限成績、可跳過，不可宴譜面、不可用段位認定模式)</div>
                <div id="level-song-grid" class="square-song-grid col-12 row ms-0">
                    ${res.join('')}
                </div>
            ` );
    }
    else if (data.type === 'gate6') {
        const gate = data.payload;
        const res = []
        gate.keySongs.forEach(song => {
            const songEntry = detailData.songs.find(s => s.songId === song.title);
            res.push(createKeySongCard({
                title: song.title,
                type: song.type,
                image: `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`
            }, {
                isCompleted: song.songLastPlayedDate > (data.domain === 'jp' ? '2025/05/09' : '2025/09/26')
            }));
        });

        const headerImg = gate.headerImg ? `<div class="d-flex justify-content-center"><img src="${gate.headerImg}" alt="Header Image"></div>` : '';
        $('#gate').html([headerImg, gate.gateImgHTML].join(''));
        $('#map').html([`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Gate</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="d-flex justify-content-center mb-4">紅門發現條件：走完地圖「ドラゴンちほー4」</div>
            `, gate.mapHTML].join(''));
        $('#song-table').html(`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Key</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">紅鑰匙獲得條件：在紅門開放後(日版:2025年5月9日 | 國際版:2025年9月26日)，打過所有樂曲名稱中包含「ドラゴン」、「DRAGON」、「Dragon」或收錄於遊戲《人中之龍》系列的歌曲
                    <br/>(任意難度、不限成績、可跳過，不可宴譜面、不可用段位認定模式)</div>
                <div id="level-song-grid" class="square-song-grid col-12 row ms-0">
                    ${res.join('')}
                </div>
            ` );
    }
    else if (data.type === 'gate7') {
        const gate = data.payload;
        const res = []
        gate.key.forEach(key => {
            res.push(`
                    <div>
                        <img src="${key.gateImg}">
                        ${key.gateAcvImgHTML}
                    </div>
                `)
        })

        const headerImg = gate.headerImg ? `<div class="d-flex justify-content-center"><img src="${gate.headerImg}" alt="Header Image"></div>` : '';
        $('#gate').html([headerImg, gate.gateImgHTML].join(''));
        $('#map').html([`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Gate</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="d-flex justify-content-center mb-4">PRiSM塔發現條件：走完地圖「7sRefちほー4」</div>
            `, gate.mapHTML].join(''));
        $('#song-table').html(`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Key</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">萬能鑰匙獲得條件：通關萬花筒模式的六扇門(獲得六個碎片)
                    <div id="gates-container">
                        <div id="gates" class="square-song-grid col-12 ms-0 gate7">
                            ${res.join('')}
                        </div>
                    </div>
                </div>
            ` );
    }
    else if (data.type === 'gate9') {
        const gate = data.payload;
        const headerImg = gate.headerImg ? `<div class="d-flex justify-content-center"><img src="${gate.headerImg}" alt="Header Image"></div>` : '';
        $('#gate').html([headerImg, gate.gateImgHTML].join(''));

        $('#song-table').html(`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Gate(Relaxed)</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">希望之門發現條件：<br>(日版:2025年7月13日12:00後 | 國際版:2025年11月19日7:00後)<br>挑戰過一次bug狀態的「KALEIDXSCOPE」</div>
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Gate(First-clear JP)</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">
                    希望之門發現條件：<br>(日版:2025年7月13日12:00前)<br>
                    <table style="width: 100%; border-collapse: collapse; border-color: rgb(255, 255, 255); height: 268px;">
                    <tbody>
                    <tr style="height: 21px;"><td style="border-color: rgb(255, 255, 255); height: 21px; width: 5%; vertical-align: top;">1.</td> <td style="border-color: rgb(255, 255, 255); height: 21px; width: 95%; vertical-align: top;">「KALEIDXSCOPE（1回目）」を完走することで獲得できる、<br>称号「サイゴノキボウ ヲミツケテ」の称号名と、説明文「キットクマガシッテイル」からヒントを得る。</td></tr> 
                    <tr style="height: 43px;"><td style="border-color: rgb(255, 255, 255); height: 43px; width: 5%; vertical-align: top;">2.</td> <td style="border-color: rgb(255, 255, 255); height: 43px; width: 95%; vertical-align: top;"><a href="https://page.line.me/ert3505r" target="_blank" rel="noopener">maimai公式LINEアカウント</a>を友だち追加して、<br>トーク画面にて<span style="color: rgb(255, 0, 0);">「サイゴノキボウ」または「最後の希望」</span>をトークすると、<br>でらっくまから「アシッド」のLINEアカウントを案内される。</td></tr> 
                    <tr style="height: 43px;"><td style="border-color: rgb(255, 255, 255); height: 43px; width: 5%; vertical-align: top;">3.</td> <td style="border-color: rgb(255, 255, 255); height: 43px; width: 95%; vertical-align: top;">「アシッド」のLINEアカウントを友だち追加して、<br>「<span>アシッドと会話をしながら情報を集めてみましょう」と表示されるまで、会話を進行する。</span></td></tr> 
                    <tr style="height: 64px;"><td style="border-color: rgb(255, 255, 255); height: 13px; width: 5%; vertical-align: top;">4.</td> <td style="border-color: rgb(255, 255, 255); height: 13px; width: 95%; vertical-align: top;">&nbsp;アシッドとの会話の中からヒントを得ながら、<br>トーク画面にて<span style="color: rgb(255, 0, 0);">「7つ目の扉」「7個目の扉」</span>などをアシッドにトークすると、さらに会話が進行できる。</td></tr> 
                    <tr style="height: 21px;"><td style="border-color: rgb(255, 255, 255); height: 21px; width: 5%; vertical-align: top;">5.</td> <td style="border-color: rgb(255, 255, 255); height: 21px; width: 95%; vertical-align: top;"><span>アシッドとの会話を進め、表示された画像内の二次元バーコードを読み取ると、</span><br> <a href="https://maimaidx.jp/maimai-mobile/home/recovery/" target="_blank" rel="noopener">maimaiでらっくすNETの隠しページ</a>にアクセスすることができる。<br>※<a href="https://maimaidx.jp/" target="_blank" rel="noopener">maimaiでらっくすNET</a>&nbsp;へのログインが必要です。</td></tr> 
                    <tr style="height: 64px;"><td style="border-color: rgb(255, 255, 255); width: 5%; height: 64px; vertical-align: top;">6.</td> <td style="border-color: rgb(255, 255, 255); width: 95%; height: 64px; vertical-align: top;"><span>エラーコード入力欄に、「KALEIDXSCOPE（1回目）」の演出で表示されたエラーコード<br> <span style="color: rgb(255, 0, 0);">「110112050904241903151605」</span>を入力すると、<br>『maimai』シリーズと『maimai でらっくす』シリーズの楽曲クリア数に応じたポイントが加算される。<br></span></td></tr> 
                    <tr style="height: 21px;"><td style="border-color: rgb(255, 255, 255); width: 5%; height: 21px; vertical-align: top;">7.</td> <td style="border-color: rgb(255, 255, 255); width: 95%; height: 21px; vertical-align: top;"><span>ゲージが満タンになった後、エラーメッセージ内に表示される<span style="color: rgb(255, 0, 0);">「バックドア」</span>をアシッドにトークする。</span></td></tr> <tr style="height: 21px;"><td style="border-color: rgb(255, 255, 255); width: 5%; height: 21px; vertical-align: top;">8.</td> <td style="border-color: rgb(255, 255, 255); width: 95%; height: 21px; vertical-align: top;"><span>アシッドとの会話を進め、「バックドアを見つけたら『扉を7回ノック』して」というヒントを得る。</span></td></tr> <tr style="height: 21px;"><td style="border-color: rgb(255, 255, 255); width: 5%; height: 21px; vertical-align: top;">9.</td> <td style="border-color: rgb(255, 255, 255); width: 95%; height: 21px; vertical-align: top;"><span><a href="https://maimai.sega.jp/maimai_finale/" target="_blank" rel="noopener">「maimai FiNALE」公式サイト</a>にアクセスし、ページ最下部にある<br> <span style="color: rgb(255, 0, 0);">CAFÉ MiLKの扉を7回クリックまたはタップ</span>することで、「サイゴノキボウ」にアクセスできる。<br></span></td></tr>
                    </tbody>
                    </table>
                </div>
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">Gate(First-clear INTL.)</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">
                    希望之門發現條件：<br>(國際版:2025年11月19日7:00前)<br>
                <table style="width: 100%; border-collapse: collapse; border-color: rgb(255, 255, 255);">
                <tbody>
                <tr style="height: 21px;"><td style="border-color: rgb(255, 255, 255); width: 5%; height: 21px; vertical-align: top;">1.</td><td style="border-color: rgb(255, 255, 255); width: 95%; height: 21px; vertical-align: top;">KALEIDXSCOPE第一次完走後獲得稱號 サイゴノキボウ ヲミツケテ（去尋找最後的希望），上述稱號取得方式顯示為.dne eht morf dlrow eht evaS，左右鏡向為 Save the world from the end</td></tr>
                <tr style="height: 21px;"><td style="border-color: rgb(255, 255, 255); width: 5%; height: 21px; vertical-align: top;">2.</td><td style="border-color: rgb(255, 255, 255); width: 95%; height: 21px; vertical-align: top;">Save This World νMIX 左右鏡向 PLAY 可獲得稱號 Knock the Bear 7th times，稱號取得方式顯示為 at HOME，提示為在 maimai 國際版官網，點擊熊 7 次。</td></tr>
                <tr style="height: 21px;"><td style="border-color: rgb(255, 255, 255); width: 5%; height: 21px; vertical-align: top;">3.</td><td style="border-color: rgb(255, 255, 255); width: 95%; height: 21px; vertical-align: top;">點<a href="https://maimai.sega.com" target="_blank" rel="noopener">官網</a>右下角的DX熊7次後會進入一個<a href="https://maimai.sega.com/countdown/">倒數頁面</a>，倒數希望之門開啟時間</td></tr>
                </tbody>
                </table>
                </div>
            ` );
    }
    else if (data.type === 'gate10') {
        const gate = data.payload;
        const headerImg = gate.headerImg ? `<div class="d-flex justify-content-center"><img src="${gate.headerImg}" alt="Header Image"></div>` : '';
        $('#gate').html([headerImg, gate.gateImgHTML].join(''));

        $('#song-table').html(`
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">KALEIDXSCOPE(BUG)</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">KALEIDXSCOPE(bug狀態)發現條件：通關「PRiSM塔」
                    <div id="gates-container">
                        <div>
                            <img src="${gate.key.gateImg}">
                            ${gate.key.gateAcvImgHTML}
                        </div>
                    </div>
                </div>
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">KALEIDXSCOPE(INTL.)</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">KALEIDXSCOPE(國際版)修復條件：
                </div>
                <div class="col-12 d-flex align-items-center my-3">
                    <div class="section-divider left"></div>
                        <b class="px-3 section-divider-title">KALEIDXSCOPE(JP)</b>
                    <div class="section-divider right"></div>
                </div>
                <div class="mb-4 text-center">KALEIDXSCOPE(日版)修復條件：
                    <p>「希望の扉」をクリアすると、カードメイカーにて「希望の鍵」がプリントできるようになります。<br>
カレイドスコープモードのセレクト画面にて、プリントした「希望の鍵」を<span style="color: rgb(255, 0, 0);">でらっくすパスの差し込み口にセット</span>することで、KALEIDXSCOPEに再挑戦できるようになります。</p>
<p>※「ゴールドパス」「フリーダムパス」の種類は問いません。<br>
※でらっくすパス読み込み画面でのセットは対象外です。カレイドスコープモードのセレクト画面にてセットする必要があります。</p>
                </div>
            ` );
    }
}

const createKeySongCard = (song, {
    isCompleted = null,
} = {}) => {
    return `
        <div class="square-song-card ${isCompleted === true ? 'completed' : ''} deg${Math.floor(Math.random() * 5)}" 
                onclick="showSongDetail('${song.title}', '${song.type}')">
            <img src=${song.image} class="square-song-image" alt="${song.title}">
            <div class="song-overlay"></div>
            <div class="square-song-info-block">
                <div class="song-content text-shadow-black square-song-title">${song.title}</div>
                <div class="song-content text-shadow-black square-song-inner-level"> ${song.type.toUpperCase()}</div>
                ${isCompleted === true ? '<div class="completion-check"><b>✓</b></div>' : ''}
                <div class="card-decoration"></div>
            </div>
        </div>`;

}
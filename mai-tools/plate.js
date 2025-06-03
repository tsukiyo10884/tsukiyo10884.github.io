let versionList = [];
let versionOrder = [];

async function initPlateList() {
    $('#song-table').html(showPlateList());

    versionList = await fetch('version.json').then(res => res.json());
    versionOrder = [...new Set(
        versionList
            .map(v => v.versionName)
            .filter(name => !name.includes('~'))
    )];

    $('#completed-only').on('change', function () {
        var input = $('#plate-progress-title').text().trim();
        console.log('input=', input);
        const regex = /^([\u4e00-\u9fa5]+)([\u4e00-\u9fa5])(?:\(([^()]+)\))?進度$/;
        const match = input.match(regex);
        console.log('match=', match);

        if (match) {
            var plateName = match[1];
            var type = match[2];
            var versionName = match[3];
            if (plateName === '覇') {
                showPlateProgress(versionName, '覇者', '');
            } else {
                showPlateProgress(versionName, type, plateName);
            }
        }
    });
}

function showPlateList() {
    return `
        <div class="container">
            <div class="row g-2">
                ${versionList.map(version => {
        let colClass = 'col-3';
        if (version.plateName === '真') colClass = 'col-6';
        else if (version.plateName === '舞') colClass = 'col-6';
        else if (version.plateName === '覇者') {
            return `
                            <div class="col-6">
                                <button class="w-100 plate-version-button" onclick="showPlateProgress('${version.versionName}', '覇者', '')">              
                                    <span style="font-size: 16px;">${version.plateName}</span>  <br/>
                                    <span style="font-size: 14px;">${version.versionName}</span>
                                </button>
                            </div>
                        `;
        }
        else if (version.plateName === '輝') colClass = 'col-12';

        return `
                        <div class="${colClass}">
                            <button class="w-100 plate-version-button" onclick="showVersionButton('${version.versionName}','${version.plateName}')">              
                                <span style="font-size: 16px;">${version.plateName}</span>  <br/>
                                <span style="font-size: 14px;">${version.versionName.replace('でらっくす', ' DX')}</span>
                            </button>
                        </div>
                        `;
    }).join('')}
            </div>
        </div>`;
}


function showVersionButton(versionName, plateName) {
    $('#song-table').html([
        `
        <div class="row">
            <div class="col-3">
                <button class="w-100" onclick="showPlateProgress('${versionName}', '極', '${plateName}')">${plateName}極</button>
            </div>`,
        (versionName == 'maimai ~ maimai PLUS') ?
            `
            <div class="col-3">
                <button class="w-100" disabled>※初代100%就AP，沒有真将</button>
            </div>`: `
            <div class="col-3">
                <button class="w-100" onclick="showPlateProgress('${versionName}', '将', '${plateName}')">${plateName}将</button>
            </div>`,
        `
            <div class="col-3">
                <button class="w-100" onclick="showPlateProgress('${versionName}', '神', '${plateName}')">${plateName}神</button>
            </div>
            <div class="col-3">
                <button class="w-100" onclick="showPlateProgress('${versionName}', '舞舞', '${plateName}')">${plateName}舞舞</button>
            </div>
        </div>`,
    ].join(''));
}

async function showPlateProgress(versionName, type, plateName) {

    var songs = data.songs;
    const today = new Date();

    var removeList = await fetch('removed_song.json')
        .then(res => res.json());
    removeList.forEach(entry => {
        const removeDate = new Date(entry.remove_date);
        if (today > removeDate) {
            const removeTitles = entry.remove_songs.map(s => s.title);
            songs = songs.filter(song => !removeTitles.includes(song.title));
        }
    });
    songs = songs.filter(song => song.title !== '全世界共通リズム感テスト');

    if (versionName === 'maimai ~ maimai PLUS') {
        songs = songs
            .filter(song => song.version === 'maimai' || song.version === 'maimai PLUS');
    } else if (versionName === 'maimai ~ FiNALE') {
        const finaleIndex = versionOrder.indexOf('FiNALE');
        songs = songs.filter(song =>
            versionOrder.indexOf(song.version) !== -1 &&
            versionOrder.indexOf(song.version) <= finaleIndex
        );
    } else {
        songs = songs
            .filter(song => song.version === versionName);
    }
    const basicTotal = songs.filter(song => song.difficulty === 'basic').length;
    const advancedTotal = songs.filter(song => song.difficulty === 'advanced').length;
    const expertTotal = songs.filter(song => song.difficulty === 'expert').length;
    const masterTotal = songs.filter(song => song.difficulty === 'master').length;
    const remasterTotal = songs.filter(song => song.difficulty === 'remaster').length;
    var basicCompleted = 0;
    var advancedCompleted = 0;
    var expertCompleted = 0;
    var masterCompleted = 0;
    var remasterCompleted = 0;
    filteredSongs = [];
    var tips = '';
    switch (type) {
        case '極':
            filteredSongs = songs.filter(song => song.fc || song.fcp || song.ap || song.app || song.fs || song.fsp || song.fdx || song.fdxp);
            tips = '全曲/BASIC～MASTER/FULL COMBO';
        case '将':
            filteredSongs = songs.filter(song => parseFloat(song.score) > 100);
            tips = '全曲/BASIC～MASTER/RANK SSS';
            break;
        case '神':
            filteredSongs = songs.filter(song => song.ap || song.app);
            tips = '全曲/BASIC～MASTER/ALL PERFECT';
            break;
        case '舞舞':
            filteredSongs = songs.filter(song => song.fdx);
            tips = '全曲/BASIC～MASTER/FULL SYNC DX';
            break;
        case '覇者':
            filteredSongs = songs.filter(song => parseFloat(song.score.replace('%', '')) >= 80);
            tips = '全曲/BASIC～RE:MASTER/clear';
            break;
    }
    basicCompleted = filteredSongs.filter(song => song.difficulty === 'basic').length;
    advancedCompleted = filteredSongs.filter(song => song.difficulty === 'advanced').length;
    expertCompleted = filteredSongs.filter(song => song.difficulty === 'expert').length;
    masterCompleted = filteredSongs.filter(song => song.difficulty === 'master').length;
    remasterCompleted = filteredSongs.filter(song => song.difficulty === 'remaster').length;

    $('#stat').html(`
        <div class="difficulty-counts section-title">
            <div class="difficulty-count"><b style="color:#81d955">BAS</b>: ${String(basicCompleted).padStart(3, " ")}/${String(basicTotal).padStart(3, " ")} = ${(basicCompleted / basicTotal * 100).toFixed(2)}%</div>
            <div class="difficulty-count"><b style="color:#f8b709">ADV</b>: ${String(advancedCompleted).padStart(3, " ")}/${String(advancedTotal).padStart(3, " ")} = ${(advancedCompleted / advancedTotal * 100).toFixed(2)}%</div>
            <div class="difficulty-count"><b style="color:#ff818d">EXP</b>: ${String(expertCompleted).padStart(3, " ")}/${String(expertTotal).padStart(3, " ")} = ${(expertCompleted / expertTotal * 100).toFixed(2)}%</div>
            <div class="difficulty-count"><b style="color:#c346e7">MAS</b>: ${String(masterCompleted).padStart(3, " ")}/${String(masterTotal).padStart(3, " ")} = ${(masterCompleted / masterTotal * 100).toFixed(2)}%</div>
            ${versionName === 'maimai ~ FiNALE' ? `<div class="difficulty-count"><b style="color:#fff">REM</b>: ${String(remasterCompleted).padStart(3, " ")}/${String(remasterTotal).padStart(3, " ")} = ${(remasterCompleted / remasterTotal * 100).toFixed(2)}%</div>` : ''}
        </div>
    `);

    $('#song-table').html(`
    <div class="section-title">
        <b id="plate-progress-title">${plateName}${type}(${versionName})進度</b>
        <div class="tips">${versionName === 'maimai ~ FiNALE' ? tips.replace('～MASTER/', '～RE:MASTER/') : tips}</div>
    </div>
    <div class="square-song-grid col-12 row" style="margin-left:0">
        ${songs
            .sort((a, b) => b.internalLevel - a.internalLevel)
            .filter(song => {
                if (versionName === 'maimai ~ FiNALE') {
                    return true;
                }
                return song.difficulty !== "remaster";
            })
            .map(song => createNamePlateSongCard(song, type)).join('')}
    </div>`);
}

function createNamePlateSongCard(song, type) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    let isCompleted = false;

    switch (type) {
        case '極':
            isCompleted = song.fc || song.fcp || song.ap || song.app || song.fs || song.fsp || song.fdx || song.fdxp;
        case '将':
            isCompleted = parseFloat(song.score) > 100;
            break;
        case '神':
            isCompleted = song.ap || song.app;
            break;
        case '舞舞':
            isCompleted = song.fdx;
            break;
        case '覇者':
            isCompleted = parseFloat(song.score.replace('%', '')) >= 80;
            break;
    }

    if ($('#completed-only').is(':checked') && !isCompleted) {
        return null;
    } else {
        return `
        <div class="plate-song-card difficulty-${diffClass} ${isCompleted ? 'completed' : ''}" style="background-image: url('${song.image}');" onclick="showSongDetail('${song.title}', '${song.type}')">
            <div class="song-overlay"></div>
            <div class="song-content text-shadow f_10 plate-song-title">${song.title}</div>
            <div class="song-content text-shadow f_10">${song.internalLevel == null ? '' : Number.parseFloat(song.internalLevel).toFixed(1)} | ${song.type.toUpperCase()}</div>
            <div class="song-content text-shadow">${song.score}</div>
            ${isCompleted ? '<div class="completion-check"><b>✓</b></div>' : ''}
        </div>`;
    }
}

function showSongDetail(title, type) {
    window.open(`https://arcade-songs.zetaraku.dev/maimai/?title=${title}&types=${type}`, '_blank');
}
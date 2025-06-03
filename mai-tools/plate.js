async function initPlateList() {
    const container = document.getElementById('song-table');
    container.innerHTML = await showPlateList()
}

async function showPlateList() {
    const versionList = await fetch('version.json').then(res => res.json());
    return `
        <div class="container">
            <div class="row g-2">
                ${versionList.map(version => {
        let colClass = 'col-3';
        if (version.plateName === '真') colClass = 'col-6';
        if (version.plateName === '輝') colClass = 'col-12';

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
    const container = document.getElementById('song-table');

    const html = [
        `
        <div class="row">
            <div class="col-3">
                <button class="w-100" onclick="showPlateProgress('${versionName}', '極', '${plateName}')">${plateName}極</button>
            </div>`,
        (versionName == 'maimai ~ maimai PLUS') ? '' : `
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
    ].join('');
    container.innerHTML = html;
}

async function showPlateProgress(versionName, type, plateName) {
    const container = document.getElementById('song-table');

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

    if (versionName === 'maimai ~ maimai PLUS') {
        songs = songs
            .filter(song => song.version === 'maimai' || song.version === 'maimai PLUS');
    } else {
        songs = songs
            .filter(song => song.version === versionName);
    }
    const basicTotal = songs.filter(song => song.difficulty === 'basic').length;
    const advancedTotal = songs.filter(song => song.difficulty === 'advanced').length;
    const expertTotal = songs.filter(song => song.difficulty === 'expert').length;
    const masterTotal = songs.filter(song => song.difficulty === 'master').length;
    var basicCompleted = 0;
    var advancedCompleted = 0;
    var expertCompleted = 0;
    var masterCompleted = 0;
    filteredSongs = [];
    switch (type) {
        case '極':
            filteredSongs = songs.filter(song => song.fc || song.fcp || song.ap || song.app || song.fs || song.fsp || song.fdx || song.fdxp);
        case '将':
            filteredSongs = songs.filter(song => parseFloat(song.score) > 100);
            break;
        case '神':
            filteredSongs = songs.filter(song => song.ap || song.app);
            break;
        case '舞舞':
            filteredSongs = songs.filter(song => song.fdx);
            break;
    }
    basicCompleted = filteredSongs.filter(song => song.difficulty === 'basic').length;
    advancedCompleted = filteredSongs.filter(song => song.difficulty === 'advanced').length;
    expertCompleted = filteredSongs.filter(song => song.difficulty === 'expert').length;
    masterCompleted = filteredSongs.filter(song => song.difficulty === 'master').length;

    $('#stat').html(`
        <div class="difficulty-counts section-title">
            <div class="difficulty-count"><b style="color:#81d955">BAS</b>: ${String(basicCompleted).padStart(2, " ")}/${basicTotal} = ${(basicCompleted / basicTotal * 100).toFixed(2)}%</div>
            <div class="difficulty-count"><b style="color:#f8b709">ADV</b>: ${String(advancedCompleted).padStart(2, " ")}/${advancedTotal} = ${(advancedCompleted / advancedTotal * 100).toFixed(2)}%</div>
            <div class="difficulty-count"><b style="color:#ff818d">EXP</b>: ${String(expertCompleted).padStart(2, " ")}/${expertTotal} = ${(expertCompleted / expertTotal * 100).toFixed(2)}%</div>
            <div class="difficulty-count"><b style="color:#c346e7">MAS</b>: ${String(masterCompleted).padStart(2, " ")}/${masterTotal} = ${(masterCompleted / masterTotal * 100).toFixed(2)}%</div>
        </div>
    `);

    container.innerHTML = 
    `
    <div class="section-title">
        <b>${plateName}${type}(${versionName})進度</b>
    </div>
    <div class="square-song-grid col-12 row" style="margin-left:0">
        ${songs
        .sort((a, b) => b.internalLevel - a.internalLevel)
        .filter(song => song.difficulty !== "remaster")
        .map(song => createNamePlateSongCard(song, type)).join('')}
    </div>`;
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
    }

    return `
    <div class="plate-song-card difficulty-${diffClass} ${isCompleted ? 'completed' : ''}" style="background-image: url('${song.image}');" onclick="showSongDetail('${song.title}', '${song.type}')">
        <div class="song-overlay"></div>
        <div class="song-content text-shadow f_10 plate-song-title">${song.title}</div>
        <div class="song-content text-shadow f_10">${song.internalLevel == null ? '' : Number.parseFloat(song.internalLevel).toFixed(1)} | ${song.type.toUpperCase()}</div>
        <div class="song-content text-shadow">${song.score}</div>
        ${isCompleted ? '<div class="completion-check"><b>✓</b></div>' : ''}
    </div>`;
}

function showSongDetail(title, type) {
    window.open(`https://arcade-songs.zetaraku.dev/maimai/?title=${title}&types=${type}`, '_blank');
}
function initLevelList() {
    const allSongs = [...data.ratingSongList.rating_new, ...data.ratingSongList.rating_others];
    const levels = allSongs.map(song => song.internalLevel);
    const maxLevel = Math.max(...levels);
    const minLevel = Math.min(...levels);
    const songs = data.songs.filter(song => {
        return song.internalLevel >= minLevel && song.internalLevel <= maxLevel;
    });

    const container = document.getElementById('song-table');

    const html = [
        createFilterButtons('S'),
        showLevelList(minLevel, maxLevel),
        `
        <div id="section-title" class="section-title">
            <b>等級${minLevel} ~ ${maxLevel}進度</b>
        </div>
        <div id="level-song-grid" class="square-song-grid col-12 row" style="margin-left:0">
            ${songs.sort((a, b) => b.internalLevel - a.internalLevel)
            .map(song => createNamePlateSongCard(song)).join('')}
        </div>`
    ].join('');
    container.innerHTML = html;
}

function showLevelList(startLevel, endLevel) {
    return `
        <div class="level-list row d-flex align-items-center justify-content-center">
            <div class="col-2">
                <input type="number" id="level-start" class="form-control" placeholder="最低等級" value="${startLevel}" />
            </div>
            <div class="col-1">
                <span style="line-height: 37.6px;">　～　</span>
            </div>
            <div class="col-2">
                <input type="number" id="level-end" class="form-control" placeholder="最高等級" value="${endLevel}" />
            </div>
        </div>
        <div class="level-list row d-flex align-items-center justify-content-center">
            <div class="col-2" align="center">
                <button onclick="showLevelListByRange()">查詢</button>
            </div>
        </div>
    `;
}

function showLevelListByRange() {

    const startLevel = parseFloat(document.getElementById('level-start').value);
    const endLevel = parseFloat(document.getElementById('level-end').value);

    if (isNaN(startLevel) || isNaN(endLevel) || startLevel > endLevel || startLevel < 1 || endLevel > 15) {
        alert("等級範圍必須在 1 到 15 之間，並 由低到高");
        return;
    }

    const songs = data.songs.filter(song => {
        return song.internalLevel >= startLevel && song.internalLevel <= endLevel;
    });
    const container = document.getElementById('level-song-grid');
    container.innerHTML = songs.sort((a, b) => b.internalLevel - a.internalLevel)
        .map(song => createLevelSongCard(song)).join('');
    const sectionTitle  = document.getElementById('section-title');
    sectionTitle.innerHTML = `
        <b>等級${startLevel} ~ ${endLevel}進度</b>
    `;
}

function createLevelSongCard(song) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    let isCompleted = false;
    let score = parseFloat(song.score.replace('%', ''));
    let type = document.querySelector('input[name="filter"]:checked').value;

    if (type === 'clear') isCompleted = score > 80;
    else if (type === 'S') isCompleted = score > 97;
    else if (type === 'S+') isCompleted = score > 98;
    else if (type === 'SS') isCompleted = score > 99;
    else if (type === 'SS+') isCompleted = score > 99.5;
    else if (type === 'SSS') isCompleted = score > 100;
    else if (type === 'SSS+') isCompleted = score > 100.5;
    else if (type === 'AP+') isCompleted = song.ap || song.app || song.fdxp;
    else if (type === 'AP') isCompleted = song.app || song.fdxp;
    else if (type === 'FC+') isCompleted = song.fcp || song.ap || song.app || song.fdx || song.fdxp;
    else if (type === 'FC') isCompleted = song.fc || song.ap || song.app || song.fcp || song.fs || song.fsp || song.fdx || song.fdxp;
    else if (type === 'FS+') isCompleted = song.fsp;
    else if (type === 'FS') isCompleted = song.fs;
    else if (type === 'FDX') isCompleted = song.fdx;
    else if (type === 'FDX+') isCompleted = song.fdxp;

    return `
    <div class="col-1 plate-song-card difficulty-${diffClass} ${isCompleted ? 'completed' : ''} " style="background-image: url('${song.image}');" onclick="showSongDetail('${song.title}', '${song.type}')">
        <div class="song-overlay"></div>
        <div class="song-content text-shadow f_10 plate-song-title">${song.title}</div>
        <div class="song-content text-shadow f_10">${song.internalLevel == null ? '' : Number.parseFloat(song.internalLevel).toFixed(1)} | ${song.type.toUpperCase()}</div>
        <div class="song-content text-shadow">${song.score}</div>
        ${isCompleted ? '<div class="completion-check"><b>✓</b></div>' : ''}
    </div>`;
}

function createFilterButtons(type) {
    const filters = [
        ['clear', 'S', 'S+', 'SS', 'SS+', 'SSS', 'SSS+'],
        ['AP+', 'AP', 'FC+', 'FC', 'FS+', 'FS', 'FDX+', 'FDX']
    ];

    let html = '<div style="justify-content: center;display: flex;">';

    filters.forEach(group => {
        html += '<div class="mb-2 btn-group" role="group">';
        group.forEach(value => {
            const id = `radio-${value}`;
            const checked = value === type ? 'checked' : '';
            html += `
            <input type="radio" class="form-check-input" name="filter" id="${id}" value="${value}" autocomplete="off" ${checked}>
            <label class="form-check-label" for="${id}">${value}</label>
            `;
        });
        html += '</div>';
    });
    html += '</div>';

    html += `<div id="statText" class="mt-2">統計：0/0</div>`;
    return html;
}

document.addEventListener('change', function (event) {
    if (event.target.name === 'filter') {
        showLevelListByRange()
    }
});
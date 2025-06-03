function initLevelList() {
    const allSongs = [...data.ratingSongList.rating_new, ...data.ratingSongList.rating_others];
    const levels = allSongs.map(song => song.internalLevel);
    const maxLevel = Math.max(...levels);
    const minLevel = Math.min(...levels);
    const songs = data.songs.filter(song => {
        return song.internalLevel >= minLevel && song.internalLevel <= maxLevel;
    });

    $('#stat').html([
        '<div class="d-flex flex-column align-items-center pt-2">',
        showLevelList(minLevel, maxLevel),
        createFilterButtons('S'),
        '</div>'
    ].join(''));
    $('#stat').show();

    $('#song-table').html(`
        <div id="section-title" class="section-title">
            <b>等級${minLevel} ~ ${maxLevel}進度</b>
        </div>
        <div id="level-song-grid" class="square-song-grid col-12 row" style="margin-left:0">
            ${songs.sort((a, b) => b.internalLevel - a.internalLevel)
            .map(song => createNamePlateSongCard(song)).join('')}
        </div>`);
    showLevelListByRange();

    $('#completed-only').on('change', function () {
        var input = $('#song-table .section-title').text().trim();
        console.log('input=', input);
        const regex = /^等級\s*(\d+(?:\.\d+)?)\s*~\s*(\d+(?:\.\d+)?)進度$/;
        const match = input.match(regex);
        console.log('match=', match);
        if (match) {
            showLevelListByRange();
        }
    });
}

function showLevelList(startLevel, endLevel) {
    return `
        <div class="level-list row d-flex align-items-center justify-content-center">
            <div class="col-3">
                <input type="number" id="level-start" class="form-control" placeholder="最低等級" value="${startLevel}" />
            </div>
            <div class="col-1">
                <span class="align-middle">～</span>
            </div>
            <div class="col-3">
                <input type="number" id="level-end" class="form-control" placeholder="最高等級" value="${endLevel}" />
            </div>
            <div class="col-3" align="center">
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

    const percent = ((filteredSongsCount(songs) / songs.length) * 100).toFixed(2);
    $('#statText').val(`達成率：${percent}% (${filteredSongsCount(songs)}/${songs.length})`);

    $('#level-song-grid').html(songs.sort((a, b) => b.internalLevel - a.internalLevel).map(song => createLevelSongCard(song)).join(''));
    $('#section-title').html(`<b>等級${startLevel} ~ ${endLevel}進度</b>`);
}

function filteredSongsCount(songs) {
    let type = $('input[name="filter"]:checked').val();

    let filteredSongs = songs.filter(song => {
        if (type === 'clear') return parseFloat(song.score.replace('%', '')) > 80;
        else if (type === 'S') return parseFloat(song.score.replace('%', '')) > 97;
        else if (type === 'S+') return parseFloat(song.score.replace('%', '')) > 98;
        else if (type === 'SS') return parseFloat(song.score.replace('%', '')) > 99;
        else if (type === 'SS+') return parseFloat(song.score.replace('%', '')) > 99.5;
        else if (type === 'SSS') return parseFloat(song.score.replace('%', '')) > 100;
        else if (type === 'SSS+') return parseFloat(song.score.replace('%', '')) > 100.5;
        else if (type === 'AP+') return song.app;
        else if (type === 'AP') return song.ap || song.app || song.fdxp;
        else if (type === 'FC+') return song.fcp || song.ap || song.app || song.fdx || song.fdxp;
        else if (type === 'FC') return song.fc || song.ap || song.app || song.fcp || song.fs || song.fsp || song.fdx || song.fdxp;
        else if (type === 'FS+') return song.fsp || song.fdx || song.fdxp;
        else if (type === 'FS') return song.fs || song.fdx;
        else if (type === 'FDX+') return song.fdxp;
        else if (type === 'FDX') return song.fdx;
    })
    return filteredSongs.length;
}

function createLevelSongCard(song) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    let isCompleted = false;
    let score = parseFloat(song.score.replace('%', ''));
    let type = $('input[name="filter"]:checked').val();

    if (type === 'clear') isCompleted = score > 80;
    else if (type === 'S') isCompleted = score > 97;
    else if (type === 'S+') isCompleted = score > 98;
    else if (type === 'SS') isCompleted = score > 99;
    else if (type === 'SS+') isCompleted = score > 99.5;
    else if (type === 'SSS') isCompleted = score > 100;
    else if (type === 'SSS+') isCompleted = score > 100.5;
    else if (type === 'AP+') isCompleted = song.app;
    else if (type === 'AP') isCompleted = song.ap || song.app || song.fdxp;
    else if (type === 'FC+') isCompleted = song.fcp || song.ap || song.app || song.fdx || song.fdxp;
    else if (type === 'FC') isCompleted = song.fc || song.ap || song.app || song.fcp || song.fs || song.fsp || song.fdx || song.fdxp;
    else if (type === 'FS+') isCompleted = song.fsp || song.fdx || song.fdxp;
    else if (type === 'FS') isCompleted = song.fs || song.fdx;
    else if (type === 'FDX') isCompleted = song.fdx;
    else if (type === 'FDX+') isCompleted = song.fdxp;

    if ($('#completed-only').is(':checked') && !isCompleted) {
        return null;
    } else{
        return `
        <div class="col-1 plate-song-card difficulty-${diffClass} ${isCompleted ? 'completed' : ''} " style="background-image: url('${song.image}');" onclick="showSongDetail('${song.title}', '${song.type}')">
            <div class="song-overlay"></div>
            <div class="song-content text-shadow f_10 plate-song-title">${song.title}</div>
            <div class="song-content text-shadow f_10">${song.internalLevel == null ? '' : Number.parseFloat(song.internalLevel).toFixed(1)} | ${song.type.toUpperCase()}</div>
            <div class="song-content text-shadow">${song.score}</div>
            ${isCompleted ? '<div class="completion-check"><b>✓</b></div>' : ''}
        </div>`;
    }
}

function createFilterButtons(type) {
    const filters = [
        ['clear', 'S', 'S+', 'SS', 'SS+', 'SSS', 'SSS+'],
        ['AP+', 'AP', 'FC+', 'FC', 'FS+', 'FS', 'FDX+', 'FDX']
    ];

    let html = '';

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
    html += '<div id="statText" class="ms-2 section-title">達成率：0/0</div>';

    return html;
}

$('input[name="filter"]').on('change', function () {
    showLevelListByRange()
});
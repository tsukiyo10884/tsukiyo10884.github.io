const SCORE_THRESHOLDS = {
    'clear': 80,
    'S': 97,
    'S+': 98,
    'SS': 99,
    'SS+': 99.5,
    'SSS': 100,
    'SSS+': 100.5
};

const FILTER_GROUPS = [
    ['clear', 'S', 'S+', 'SS', 'SS+', 'SSS', 'SSS+'],
    ['AP', 'AP+', 'FC', 'FC+', 'FS', 'FS+', 'FDX', 'FDX+']
];

function initLevelList() {
    if (!data.ratingSongList) {
        const topSongs = getTop50Songs();
        data.ratingSongList = {
            rating_new: topSongs.filter(s => s.version_international === currentVersion),
            rating_others: topSongs.filter(s => s.version_international !== currentVersion)
        };
    }

    const allSongs = [...data.ratingSongList.rating_new, ...data.ratingSongList.rating_others];
    const levels = allSongs.map(song => song.internalLevel);
    const maxLevel = Math.max(...levels);
    const minLevel = Math.min(...levels);
    const songs = data.songs.filter(song => song.internalLevel >= minLevel && song.internalLevel <= maxLevel);

    $('#stat').html(`
        <div class="d-flex flex-column align-items-center justify-content-center pt-2" style="min-height: 100px;">
            ${showLevelList(minLevel, maxLevel)}
            ${createFilterButtons('S')}
        </div>
    `).show();

    $('#song-table').html(`
        <div id="section-title" class="section-title text-shadow-black">
            <b>等級${minLevel} ~ ${maxLevel}進度</b>
        </div>
        <div id="level-song-grid" class="square-song-grid col-12 row" style="margin-left:0">
            ${songs.sort((a, b) => b.internalLevel - a.internalLevel)
                .map(song => createLevelSongCard(song)).join('')}
        </div>
    `);

    showLevelListByRange();
    bindLevelEventListeners();
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
    const startLevel = parseFloat($('#level-start').val());
    const endLevel = parseFloat($('#level-end').val());

    if (!isValidLevelRange(startLevel, endLevel)) {
        alert("等級範圍必須在 1 到 15 之間，並由低到高");
        return;
    }

    const songs = data.songs.filter(song => 
        song.internalLevel >= startLevel && song.internalLevel <= endLevel
    );

    updateStatistics(songs);
    updateSongGrid(songs, startLevel, endLevel);
}

function isValidLevelRange(startLevel, endLevel) {
    return !isNaN(startLevel) && !isNaN(endLevel) && 
           startLevel <= endLevel && 
           startLevel >= 1 && endLevel <= 15;
}

function updateStatistics(songs) {
    const completedCount = filteredSongsCount(songs);
    const percent = ((completedCount / songs.length) * 100).toFixed(2);
    $('#statText').html(`達成率：${percent}% (${completedCount}/${songs.length})`);
}

function updateSongGrid(songs, startLevel, endLevel) {
    $('#level-song-grid').html(
        songs.sort((a, b) => b.internalLevel - a.internalLevel)
            .map(song => createLevelSongCard(song))
            .filter(card => card !== null)
            .join('')
    );
    $('#section-title').html(`<b>等級${startLevel} ~ ${endLevel}進度</b>`);
}

function filteredSongsCount(songs) {
    const filterType = $('input[name="filter"]:checked').val();
    return songs.filter(song => isSongCompleted(song, filterType)).length;
}

function isSongCompleted(song, filterType) {
    const score = parseFloat(song.score.replace('%', ''));
    
    if (SCORE_THRESHOLDS[filterType]) {
        return score > SCORE_THRESHOLDS[filterType];
    }

    switch(filterType) {
        case 'AP': return song.ap || song.app || song.fdxp;
        case 'AP+': return song.app;
        case 'FC': return song.fc || song.ap || song.app || song.fcp || song.fs || song.fsp || song.fdx || song.fdxp;
        case 'FC+': return song.fcp || song.ap || song.app || song.fdx || song.fdxp;
        case 'FS': return song.fs || song.fdx;
        case 'FS+': return song.fsp || song.fdx || song.fdxp;
        case 'FDX': return song.fdx;
        case 'FDX+': return song.fdxp;
        default: return false;
    }
}

function createLevelSongCard(song) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    const filterType = $('input[name="filter"]:checked').val();
    const isCompleted = isSongCompleted(song, filterType);

    if (($('#completed-only').is(':checked') && !isCompleted) ||
        ($('#non-completed-only').is(':checked') && isCompleted)) {
        return null;
    }

    return `
        <div class="col-1 square-song-card difficulty-${diffClass} ${isCompleted ? 'completed' : ''}" 
             style="background-image: url('${song.image}');" 
             onclick="showSongDetail('${song.title}', '${song.type}')">
            <div class="song-overlay"></div>
            <div class="song-content text-shadow-black square-song-title">${song.title}</div>
            <div class="song-content text-shadow-black square-song-inner-level">${song.internalLevel == null ? '' : Number.parseFloat(song.internalLevel).toFixed(1)} | ${song.type.toUpperCase()}</div>
            <div class="song-content text-shadow-black square-song-score">${song.score}</div>
            ${isCompleted ? '<div class="completion-check"><b>✓</b></div>' : ''}
        </div>`;
}

function createFilterButtons(defaultType) {
    let html = FILTER_GROUPS.map(group => `
        <div class="mb-2 btn-group" role="group">
            ${group.map(value => `
                <input type="radio" class="form-check-input" name="filter" id="radio-${value}" 
                       value="${value}" autocomplete="off" ${value === defaultType ? 'checked' : ''}>
                <label class="form-check-label" for="radio-${value}">${value}</label>
            `).join('')}
        </div>
    `).join('');

    html += '<div id="statText">達成率：0/0</div>';
    return html;
}

function bindLevelEventListeners() {
    $('input[name="filter"]').off('change');
    handleCompletionFilters();
    
    $('input[name="filter"]').on('change', showLevelListByRange);
    $('#completed-only, #non-completed-only').on('change', function() {
        const $input = $('#song-table .section-title').text().trim();
        if (/^等級\s*(\d+(?:\.\d+)?)\s*~\s*(\d+(?:\.\d+)?)進度$/.test($input)) {
            showLevelListByRange();
        }
    });
}
const FILTER_GROUPS = [
    ['clear', 'S', 'S+', 'SS', 'SS+', 'SSS', 'SSS+'],
    ['AP', 'AP+', 'FC', 'FC+', 'FS', 'FS+', 'FDX', 'FDX+']
];

const initLevelList = () => {
    if (!data.ratingSongList) {
        const topSongs = getTop50Songs();
        data.ratingSongList = {
            rating_new: songFilter(topSongs, { is_new_version: true }),
            rating_others: songFilter(topSongs, { is_new_version: false })
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

const showLevelList = (startLevel, endLevel) => {
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

const showLevelListByRange = () => {
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

const isValidLevelRange = (startLevel, endLevel) => {
    return !isNaN(startLevel) && !isNaN(endLevel) &&
        startLevel <= endLevel &&
        startLevel >= 1 && endLevel <= 15;
}

const updateStatistics = (songs) => {
    const completedCount = filteredSongsCount(songs);
    const percent = ((completedCount / songs.length) * 100).toFixed(2);
    $('#statText').html(`達成率：${percent}% (${completedCount}/${songs.length})`);
}

const updateSongGrid = (songs, startLevel, endLevel) => {
    $('#level-song-grid').html(
        songs.sort((a, b) => b.internalLevel - a.internalLevel)
            .map(song => createLevelSongCard(song))
            .filter(card => card !== null)
            .join('')
    );
    $('#section-title').html(`<b>等級${startLevel} ~ ${endLevel}進度</b>`);
    $('#now-title').text(`level|${startLevel}|${endLevel}`);
}

const filteredSongsCount = (songs) => {
    const filterType = $('input[name="filter"]:checked').val();
    return songs.filter(song => isSongCompleted(song, filterType)).length;
}

const isSongCompleted = (song, filterType) => {
    const score = parseFloat(song.score.replace('%', ''));

    const threshold = SCORE_THRESHOLDS.find(t => t.name === filterType);
    if (threshold) {
        return score > threshold.score;
    }

    switch (filterType) {
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

const createLevelSongCard = (song) => {
    const filterType = $('input[name="filter"]:checked').val();
    const isCompleted = isSongCompleted(song, filterType);

    return createSquareSongCard(song, {
        isCompleted: isCompleted,
    });
}

const createFilterButtons = (defaultType) => {
    let html = FILTER_GROUPS.map(group => `
        <div class="mb-2 btn-group" role="group">
            ${group.map(value => `
                <input type="radio" class="form-check-input ms-2" name="filter" id="radio-${value}" 
                    value="${value}" autocomplete="off" ${value === defaultType ? 'checked' : ''}>
                <label class="form-check-label" for="radio-${value}">${value}</label>
            `).join('')}
        </div>
    `).join('');

    html += '<div id="statText">達成率：0/0</div>';
    return html;
}

const bindLevelEventListeners = () => {
    $('input[name="filter"]').off('change');
    $('input[name="filter"]').on('change', showLevelListByRange);
}
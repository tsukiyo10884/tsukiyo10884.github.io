// 達成項目
const ACHIVEMENT_GROUPS = [
    ['clear', 'S', 'S+', 'SS', 'SS+', 'SSS', 'SSS+'],
    ['AP', 'AP+', 'FC', 'FC+', 'FS', 'FS+', 'FDX', 'FDX+']
];

// 初始化等級列表
const initLevelList = () => {
    if (!data.ratingSongList) {
        const topSongs = getTop50Songs();
        data.ratingSongList = {
            rating_new: songFilter(topSongs, { isNewVersion: true }),
            rating_others: songFilter(topSongs, { isNewVersion: false })
        };
    }

    const allSongs = [...data.ratingSongList.rating_new, ...data.ratingSongList.rating_others];
    const levels = allSongs.map(song => song.internalLevel);
    const minLevel = Math.min(...levels) === 0 ? 10 : Math.min(...levels);
    const maxLevel = Math.max(...levels) === 0 ? 10 : Math.max(...levels);
    const songs = songFilter(data.songs, { minLevel: minLevel, maxLevel: maxLevel });

    $('#stat').html(`
        <div class="d-flex flex-column align-items-center justify-content-center pt-2" style="min-height: 100px;">
            <div class="level-list row d-flex align-items-center justify-content-center">
            <div class="col-3">
                <input type="number" id="level-min" class="form-control" placeholder="最低等級" value="${minLevel}" />
            </div>
            <div class="col-1">
                <span class="align-middle">～</span>
            </div>
            <div class="col-3">
                <input type="number" id="level-max" class="form-control" placeholder="最高等級" value="${maxLevel}" />
            </div>
            <div class="col-3" align="center">
                <button onclick="showLevelListByRange()">查詢</button>
            </div>
        </div>
            ${createAchivementButtons('S')}
        </div>
    `).show();

    $('#song-table').html(`
        <div id="section-title" class="section-title text-shadow-black">
            <b>等級${minLevel} ~ ${maxLevel}進度</b>
        </div>
        <div id="level-song-grid" class="square-song-grid col-12 row" style="margin-left:0">
            ${songs.sort((a, b) => b.internalLevel - a.internalLevel)
            .map(song => createSquareSongCard(song, { isCompleted: isSongCompleted(song, $('input[name="achivement"]:checked').val()) })).join('')}
        </div>
    `);

    showLevelListByRange();
    bindLevelEventListeners();
}

// 顯示等級範圍的歌曲列表
const showLevelListByRange = () => {
    const minLevel = parseFloat($('#level-min').val());
    const maxLevel = parseFloat($('#level-max').val());

    if (!isValidLevelRange(minLevel, maxLevel)) {
        alert("等級範圍必須在 1 到 15 之間，並由低到高");
        return;
    }

    const songs = songFilter(data.songs, { minLevel: minLevel, maxLevel: maxLevel });
    updateStatistics(songs);
    updateSongGrid(songs, minLevel, maxLevel);
}

// 檢查等級範圍是否有效
const isValidLevelRange = (minLevel, maxLevel) => {
    return !isNaN(minLevel) && !isNaN(maxLevel) &&
        minLevel <= maxLevel &&
        minLevel >= 1 && maxLevel <= 15;
}

// 更新達成率
const updateStatistics = (songs) => {
    const completedCount = filteredSongsCount(songs);
    const percent = ((completedCount / songs.length) * 100).toFixed(2);
    $('#statText').html(`達成率：${percent}% (${completedCount}/${songs.length})`);
}

// 更新歌曲列表
const updateSongGrid = (songs, minLevel, maxLevel) => {


    let groupedSongs = {};
    songs.forEach(song => {
        const key = formatLevel(song.internalLevel);
        if (!groupedSongs[key]) {
            groupedSongs[key] = [];
        }
        groupedSongs[key].push(song);
    });

    const songCards = Object.entries(groupedSongs).sort(([a], [b]) => parseFloat(b) - parseFloat(a)).map(([level, songList]) => {
        const header = `
        <div class="col-12 d-flex align-items-center my-3">
            <div class="flex-grow-1 section-divider border-2"></div>
            <b class="px-3">${level}</b>
            <div class="flex-grow-1 section-divider border-2"></div>
        </div>`;

        const cards = songList
            .map(song => createSquareSongCard(song, { isCompleted: isSongCompleted(song, $('input[name="achivement"]:checked').val()) }))
            .filter(card => card !== null)
            .join('');

        if (cards === '') return '';

        return header + cards;
    }).join('');

    $('#level-song-grid').html(songCards);
    $('#section-title').html(`<b>等級${minLevel} ~ ${maxLevel}進度</b>`);
    $('#now-title').text(`level|${minLevel}|${maxLevel}`);
}

// 計算達成條件的歌曲數量
const filteredSongsCount = (songs) => {
    const filterType = $('input[name="achivement"]:checked').val();
    return songs.filter(song => isSongCompleted(song, filterType)).length;
}

// 判斷歌曲是否達成條件
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

// 建立成就按鈕
const createAchivementButtons = (defaultType) => {
    let html = ACHIVEMENT_GROUPS.map(group => `
        <div class="mb-2 btn-group" role="group">
            ${group.map(value => `
                <input type="radio" class="form-check-input ms-2" name="achivement" id="radio-${value}" 
                    value="${value}" autocomplete="off" ${value === defaultType ? 'checked' : ''}>
                <label class="form-check-label" for="radio-${value}">${value}</label>
            `).join('')}
        </div>
    `).join('');

    html += '<div id="statText">達成率：0/0</div>';
    return html;
}

// 監聽成就按鈕變更事件
const bindLevelEventListeners = () => {
    $('input[name="achivement"]').off('change');
    $('input[name="achivement"]').on('change', showLevelListByRange);
}
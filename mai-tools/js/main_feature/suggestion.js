let gainChartList = [];
let selectedRatingThreshold = null;
let groupedNewSongs = {};
let groupedOldSongs = {};

// 重新計算候選曲資料(能加分的等級及其分組)
const refreshSuggestionData = () => {
    gainChartList = rangeCanGainRating(generalData.songs, getTop50Songs());
    groupedNewSongs = groupSongs(true);
    groupedOldSongs = groupSongs(false);
}

// 初始化候選曲列表
async function initSuggestionList() {
    refreshSuggestionData();
    const $newSongsSection = createButtonSection('new songs');
    const $oldSongsSection = createButtonSection('others');

    $('#song-table').empty().append($newSongsSection, $oldSongsSection);
    $('#stat').empty();
}

// 計算能加分的等級範圍
const rangeCanGainRating = (allSongs, top50Songs) => {
    const newSongs = songFilter(allSongs, { isNewVersion: true });
    const oldSongs = songFilter(allSongs, { isNewVersion: false });
    const newTopSongs = songFilter(top50Songs, { isNewVersion: true });
    const oldTopSongs = songFilter(top50Songs, { isNewVersion: false });

    const newMinRating = Math.min(...newTopSongs.map(s => calculateSongRating(s)));
    const oldMinRating = Math.min(...oldTopSongs.map(s => calculateSongRating(s)));

    const newSuggestions = calculateSuggestions(newSongs, newMinRating, true);
    const oldSuggestions = calculateSuggestions(oldSongs, oldMinRating, false);

    return [...newSuggestions, ...oldSuggestions].sort((a, b) => parseFloat(a.level) - parseFloat(b.level));
}

// 等級分組(.0~.6為一組，.6~.9為另一組)
const groupSongs = (isNewVersion) => {
    return gainChartList.filter(s => s.isNewVersion === isNewVersion).reduce((acc, song) => {
        const groupKey = getLevelGroupKey(song.level);

        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(song);
        return acc;
    }, {});
}

// 計算推薦等級可以加多少rating
const calculateSuggestions = (songs, minRating, isNewVersion) => {
    const groupedByLevel = songs.reduce((acc, song) => {
        if (!acc[song.internalLevel]) acc[song.internalLevel] = [];
        acc[song.internalLevel].push(song);
        return acc;
    }, {});

    return Object.entries(groupedByLevel).map(([level, _]) => {
        const lv = Number(level);
        const upgrades = SCORE_THRESHOLDS.map(({ name, score }) => {
            const rating = achi2rating_splashplus(lv * 10, parseFloat(score) * 10000);
            const diff = rating - minRating;

            return {
                rank: name,
                rating,
                gain: diff > 0 ? '+' + diff.toFixed(0) : '+0'
            };
        });

        return {
            level: lv,
            isNewVersion: isNewVersion,
            upgrades,
        };
    }).filter(item => item.upgrades.some(upg => upg.gain !== '+0'));
}

// 建立按鈕區塊
const createButtonSection = (title) => {
    const $section = $('<div>');
    const $title = $('<div>').addClass('section-title text-shadow-black').text(title);
    const $buttonsContainer = $('<div>').addClass('level-buttons-container mb-3 text-center row');
    let isNewVersion = null;

    let groupedSongs = {}
    switch (title) {
        case 'new songs':
            groupedSongs = groupedNewSongs;
            isNewVersion = true;
            break;
        case 'others':
            groupedSongs = groupedOldSongs;
            isNewVersion = false;
            break;
        case 'all songs':
            for (const key of new Set([...Object.keys(groupedNewSongs), ...Object.keys(groupedOldSongs)])) {
                groupedSongs[key] = [
                    ...(groupedNewSongs[key] || []),
                    ...(groupedOldSongs[key] || [])
                ];
            }
            break;
    }
    Object.entries(groupedSongs)
        .sort(([a], [b]) => {
            const aNum = parseFloat(a);
            const bNum = parseFloat(b);
            return aNum - bNum;
        })
        .forEach(([groupKey, groupSongs]) => {
            $buttonsContainer.append(createLevelButton(groupSongs[0], groupKey, isNewVersion));
        });

    $buttonsContainer.append(createLevelButton(null, 'all', isNewVersion));

    return $section.append($title, $buttonsContainer);
};

// 建立等級按鈕
const createLevelButton = (gainChart, displayLevel, isNewVersion) => {
    return $('<button>')
        .addClass('me-2 col-1 mb-2')
        .text(displayLevel)
        .on('click', () => showLevelDetails(gainChart, isNewVersion));
}

// 依等級顯示成就項目及歌卡
const showLevelDetails = (gainChart, isNewVersion) => {
    createAchievementButtonsSuggestion();
    bindRatingThresholdEventListeners();

    const isAll = gainChart === null;
    const displayLevel = isAll ? 'all' : getLevelGroupKey(gainChart.level);
    const versionTitle = getVersionTitle(isNewVersion);
    const titleText = isAll ? `所有等級候選曲(${versionTitle})` : `等級${displayLevel}候選曲(${versionTitle})`;

    const $songGrid = createSuggestionSongCard(gainChart, isNewVersion);
    const $title = $('<div>').addClass('section-title text-shadow-black').text(titleText);
    $('#now-title').text(`suggestion|${displayLevel}|${versionTitle}`);
    $('#song-table').empty().append($title, $songGrid);

    if (selectedRatingThreshold) {
        handleFilterChange();
    }
}

// 建立單一成就項目(S,SS那些)的radio
const createThresholdRadio = (name) => {
    const id = `threshold-${name}`;
    const $input = $('<input>')
        .addClass('form-check-input')
        .attr({ type: 'radio', name: 'rating-threshold', id, value: name })
        .prop('checked', selectedRatingThreshold === name);
    const $label = $('<label>').addClass('form-check-label').attr('for', id).text(name);
    return $('<div>').addClass('form-check').append($input, $label);
}

// 建立成就項目(S,SS那些)按鈕，交錯分配到左右兩欄
const createAchievementButtonsSuggestion = () => {
    if (selectedRatingThreshold === null) {
        selectedRatingThreshold = 'SSS+';
    }

    const $cols = [$('<div>').addClass('col-auto'), $('<div>').addClass('col-auto')];
    SCORE_THRESHOLDS.slice(1).forEach(({ name }, i) => {
        $cols[i % 2].append(createThresholdRadio(name));
    });

    const $radioContainer = $('<div>').addClass('row g-4').append($cols[0], $cols[1]);
    $('#stat').empty().append($('<div id="suggestion-stat" class="d-flex align-items-center h-100">').append($radioContainer));
}

// 取得要顯示的候選曲(gainChart為null時代表所有等級)
const getSuggestionSongs = (gainChart, isNewVersion) => {
    const { minLevel, maxLevel } = gainChart == null
        ? {
            minLevel: Math.min(...gainChartList.map(s => s.level)),
            maxLevel: Math.max(...gainChartList.map(s => s.level))
        }
        : calculateLevelRange(gainChart.level);

    const filter = { minLevel, maxLevel };
    if (isNewVersion != null) filter.isNewVersion = isNewVersion;
    return songFilter(generalData.songs, filter);
}

// 建立建議歌卡
const createSuggestionSongCard = (gainChart, isNewVersion) => {
    const songs = getSuggestionSongs(gainChart, isNewVersion);
    const selectedThreshold = $('input[name="rating-threshold"]:checked').val();
    const { rating_new, rating_others } = generalData.ratingSongList;
    const allRatingSongs = [...rating_new, ...rating_others];

    const groupedSongs = new Map();
    songs
        .sort((a, b) => b.internalLevel - a.internalLevel)
        .forEach(song => {
            const groupKey = formatLevel(song.internalLevel);
            if (!groupedSongs.has(groupKey)) groupedSongs.set(groupKey, []);
            groupedSongs.get(groupKey).push(song);
        });

    // 單首歌的候選卡片(不需要顯示時回傳null)
    const createCandidateCard = (song) => {
        const chart = gainChartList.find(s => s.level === song.internalLevel && s.isNewVersion === (song.versionInternational === currentVersion));
        const rankGain = chart?.upgrades.find(upg => upg.rank === selectedThreshold);
        if (!rankGain) return null;

        const targetRating = rankGain.rating;
        let gain = rankGain.gain;

        // 如果已經在R表上的歌就要跟現有分數比
        const [existingSong] = songFilter(allRatingSongs, { internalLevel: song.internalLevel, title: song.title });
        if (existingSong) {
            gain = '+' + (targetRating - existingSong.rating);
        }

        song.targetRating = targetRating;
        song.ratingGain = gain;
        if (gain === '+0' || calculateSongRating(song) >= targetRating) return null;

        return createSquareSongCard(song, { isPlayed: song.score !== '0.0000%' });
    };

    const songCards = Array.from(groupedSongs).map(([level, songList]) => {
        const cards = songList.map(createCandidateCard).filter(card => card !== null).join('');
        if (cards === '') return '';

        return `
            <div class="col-12 d-flex align-items-center my-3 p-0">
                <div class="section-divider left"></div>
                <b class="px-3 section-divider-title">${level}</b>
                <div class="section-divider right"></div>
            </div>${cards}`;
    }).join('');

    if (!songCards) {
        return $('<div>').addClass('square-song-grid col-12 row ms-0 text-center').html('<div class="col-12 py-5">無</div>');
    }

    return $('<div>').addClass('square-song-grid col-12 row ms-0').html(songCards);
}

// 監聽成就項目變更
const bindRatingThresholdEventListeners = () => {
    $('input[name="rating-threshold"]').off('change');
    $('input[name="rating-threshold"]').on('change', function () {
        selectedRatingThreshold = $(this).val();
        handleFilterChange();
    });
}

// 查找符合條件的建議項目
const findMatchingSuggestion = (displayLevel, isNewVersion) => {
    return gainChartList.find(s =>
        getLevelGroupKey(s.level) === displayLevel &&
        (isNewVersion === null || s.isNewVersion === isNewVersion)
    );
}
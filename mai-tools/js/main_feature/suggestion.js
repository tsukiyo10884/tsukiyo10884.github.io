let gainChartList = [];
let selectedRatingThreshold = null;
let groupedNewSongs = {};
let groupedOldSongs = {};

// 初始化候選曲列表
async function initSuggestionList() {
    gainChartList = rangeCanGainRating(data.songs, getTop50Songs());
    groupedNewSongs = groupSongs(true);
    groupedOldSongs = groupSongs(false);
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
        const level = song.level;
        const baseLevel = Math.floor(level);
        const decimal = level - baseLevel;
        const groupKey = decimal < 0.6 ? baseLevel : `${baseLevel}+`;

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
    createAchivementButtonsSuggestion();
    bindRatingThresholdEventListeners();

    if (gainChart === null) {
        const $songGrid = createSuggestionSongCard(gainChart, isNewVersion);
        const displayLevel = 'all';
        let versionTitle = "";
        switch (isNewVersion) {
            case null:
                versionTitle = "不分新舊";
                break;
            case true:
                versionTitle = "新曲";
                break;
            case false:
                versionTitle = "舊曲";
                break;
        }
        const $title = $(`<div>`).addClass('section-title text-shadow-black').text(`所有等級候選曲(${versionTitle})`);
        $('#now-title').text(`suggestion|${displayLevel}|${versionTitle}`);
        $('#song-table').empty().append($title, $songGrid);
    } else {
        const $songGrid = createSuggestionSongCard(gainChart, isNewVersion);
        const baseLevel = Math.floor(gainChart.level);
        const decimal = gainChart.level - baseLevel;
        const displayLevel = decimal < 0.6 ? baseLevel : `${baseLevel}+`;
        let versionTitle = "";
        switch (isNewVersion) {
            case null:
                versionTitle = "不分新舊";
                break;
            case true:
                versionTitle = "新曲";
                break;
            case false:
                versionTitle = "舊曲";
                break;
        }
        const $title = $(`<div>`).addClass('section-title text-shadow-black').text(`等級${displayLevel}候選曲(${versionTitle})`);
        $('#now-title').text(`suggestion|${displayLevel}|${versionTitle}`);
        $('#song-table').empty().append($title, $songGrid);
    }

    if (selectedRatingThreshold) {
        handleFilterChange();
    }
}

// 建立成就項目(S,SS那些)按鈕
const createAchivementButtonsSuggestion = () => {
    const $radioContainer = $('<div>').addClass('row g-4');
    const $radioCol1 = $('<div>').addClass('col-auto');
    const $radioCol2 = $('<div>').addClass('col-auto');

    if (selectedRatingThreshold === null) {
        selectedRatingThreshold = 'SSS+';
    }

    for (let i = 1; i < SCORE_THRESHOLDS.length; i += 2) {
        const $radio1 = $('<div>').addClass('form-check');
        const $input1 = $('<input>')
            .addClass('form-check-input')
            .attr('type', 'radio')
            .attr('name', 'rating-threshold')
            .attr('id', `threshold-${SCORE_THRESHOLDS[i].name}`)
            .attr('value', SCORE_THRESHOLDS[i].name)
            .prop('checked', selectedRatingThreshold === SCORE_THRESHOLDS[i].name);
        const $label1 = $('<label>')
            .addClass('form-check-label')
            .attr('for', `threshold-${SCORE_THRESHOLDS[i].name}`)
            .text(SCORE_THRESHOLDS[i].name);
        $radio1.append($input1, $label1);
        $radioCol1.append($radio1);

        if (i + 1 < SCORE_THRESHOLDS.length) {
            const $radio2 = $('<div>').addClass('form-check');
            const $input2 = $('<input>')
                .addClass('form-check-input')
                .attr('type', 'radio')
                .attr('name', 'rating-threshold')
                .attr('id', `threshold-${SCORE_THRESHOLDS[i + 1].name}`)
                .attr('value', SCORE_THRESHOLDS[i + 1].name)
                .prop('checked', selectedRatingThreshold === SCORE_THRESHOLDS[i + 1].name);
            const $label2 = $('<label>')
                .addClass('form-check-label')
                .attr('for', `threshold-${SCORE_THRESHOLDS[i + 1].name}`)
                .text(SCORE_THRESHOLDS[i + 1].name);
            $radio2.append($input2, $label2);
            $radioCol2.append($radio2);
        }
    }

    $radioContainer.append($radioCol1, $radioCol2);
    $('#stat').empty().append($('<div id="suggestion-stat" class="d-flex align-items-center h-100">').append($radioContainer));
}

// 建立建議歌卡
const createSuggestionSongCard = (gainChart, isNewVersion) => {
    let songs = []
    if (gainChart === null || gainChart === undefined) {
        const minLevel = Math.min(...gainChartList.map(s => s.level));
        const maxLevel = Math.max(...gainChartList.map(s => s.level));
        if (isNewVersion === null || isNewVersion === undefined) {
            songs = songFilter(data.songs, { minLevel: minLevel, maxLevel: maxLevel });
        } else {
            songs = songFilter(data.songs, { isNewVersion: isNewVersion, minLevel: minLevel, maxLevel: maxLevel });
        }
    } else {
        const { minLevel, maxLevel } = calculateLevelRange(gainChart.level);

        if (isNewVersion == null) {
            songs = songFilter(data.songs, { minLevel: minLevel, maxLevel: maxLevel });
        } else {
            songs = songFilter(data.songs, { isNewVersion: isNewVersion, minLevel: minLevel, maxLevel: maxLevel });
        }
    }

    const groupedSongs = new Map();
    songs
        .sort((a, b) => b.internalLevel - a.internalLevel)
        .forEach(song => {
            const groupKey = formatLevel(song.internalLevel);
            if (!groupedSongs[groupKey]) {
                groupedSongs[groupKey] = [];
            }
            if (!groupedSongs.has(groupKey)) groupedSongs.set(groupKey, []);
            groupedSongs.get(groupKey).push(song);
        });

    const songCards = Array.from(groupedSongs)
        .map(([level, songList]) => {

            const header = `
            <div class="col-12 d-flex align-items-center my-3 p-0">
                <div class="section-divider left"></div>
                <b class="px-3 section-divider-title">${level}</b>
                <div class="section-divider right"></div>
            </div>`;

            const cards = songList.map(song => {
                const currentRating = calculateSongRating(song);

                const selectedThreshold = $('input[name="rating-threshold"]:checked').val();
                const gainChart = gainChartList.find(s => s.level === song.internalLevel && s.isNewVersion === (song.versionInternational === currentVersion));
                if (!gainChart) return null;
                const rankGain = gainChart.upgrades.find(upg => upg.rank === selectedThreshold);
                if (!rankGain) return null;

                const targetRating = rankGain.rating;
                let gain = rankGain.gain;
                
                // 如果已經在R表上的歌就要跟現有分數比
                const allRatingSongs = [...data.ratingSongList.rating_new, ...data.ratingSongList.rating_others];
                if (songFilter(allRatingSongs, { internalLevel: song.internalLevel, title: song.title }).length > 0) {
                    const existingSong = songFilter(allRatingSongs, { internalLevel: song.internalLevel, title: song.title })[0];
                    gain = '+' + (targetRating - existingSong.rating);
                }

                song.targetRating = targetRating;
                song.ratingGain = gain;
                if (gain === '+0' || currentRating >= targetRating) return null;

                return createSquareSongCard(song, { isPlayed: song.score !== '0.0000%' });
            }).filter(card => card !== null).join('');

            if (cards === '') return '';

            return header + cards;
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
    if (isNewVersion === null) {
        return gainChartList.find(s => {
            const baseLevel = Math.floor(s.level);
            const decimal = s.level - baseLevel;
            const groupKey = decimal < 0.6 ? baseLevel.toString() : `${baseLevel}+`;
            return groupKey === displayLevel;
        });
    }
    return gainChartList.find(s => {
        const baseLevel = Math.floor(s.level);
        const decimal = s.level - baseLevel;
        const groupKey = decimal < 0.6 ? baseLevel.toString() : `${baseLevel}+`;
        return groupKey === displayLevel && s.isNewVersion === isNewVersion;
    });
}
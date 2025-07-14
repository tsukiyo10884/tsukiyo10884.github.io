let gainListAll = [];
let selectedRatingThreshold = null;
let groupedNewSongs = {};
let groupedOldSongs = {};

// 初始化候選曲列表
async function initSuggestionList() {
    gainListAll = songsCanGainRating(data.songs, getTop50Songs());
    groupedNewSongs = groupSongs(gainListAll, true);
    groupedOldSongs = groupSongs(gainListAll, false);
    const $newSongsSection = createButtonSection('new songs');
    const $oldSongsSection = createButtonSection('others');

    $('#song-table').empty().append($newSongsSection, $oldSongsSection);
    $('#stat').empty();
}

// 等級分組(.0~.6為一組，.6~.9為另一組)
const groupSongs = (gainListAll, isNewVersion) => {
    return gainListAll.filter(s => s.isNewVersion === isNewVersion).reduce((acc, song) => {
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

// 找出能加分的曲子
const songsCanGainRating = (allSongs, top50Songs) => {
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
    let isNewVersion;

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
            if (title === 'all songs') {
                $buttonsContainer.append(createLevelButtonXuan(groupSongs[0], groupKey));
            } else {
                $buttonsContainer.append(createLevelButton(groupSongs[0], groupKey));
            }
        });
    $buttonsContainer.append($('<button>')
        .addClass('me-2 col-1 mb-2')
        .text('all')
        .on('click', () => showLevelDetails(isNewVersion)));

    return $section.append($title, $buttonsContainer);
};

// 建立等級按鈕
const createLevelButton = (gainList, displayLevel) => {
    return $('<button>')
        .addClass('me-2 col-1 mb-2')
        .text(displayLevel)
        .on('click', () => showLevelDetails(gainList));
}

// 依等級顯示成就項目及歌卡
const showLevelDetails = (gainList) => {
    createAchivementButtonsSuggestion();
    bindRatingThresholdEventListeners();

    if (gainList === true || gainList === false) {
        let $songGrid = createSuggestionSongCard(gainList);
        const $title = $('<div>').addClass('section-title text-shadow-black').text('所有候選曲');
        $('#now-title').text(`suggestion|all|${gainList}`);
        $('#song-table').empty().append($title, $songGrid);
    } else {
        const $songGrid = createSuggestionSongCard(gainList);
        const baseLevel = Math.floor(gainList.level);
        const decimal = gainList.level - baseLevel;
        const displayLevel = decimal < 0.6 ? baseLevel : `${baseLevel}+`;
        const $title = $(`<div>`).addClass('section-title text-shadow-black').text(`等級${displayLevel}候選曲(${gainList.isNewVersion ? '新曲' : '舊曲'})`);
        $('#now-title').text(`suggestion|${displayLevel}|${gainList.isNewVersion}`);
        $('#song-table').empty().append($title, $songGrid);
    }

    if (selectedRatingThreshold) {
        handlePlayedFilters();
    }
}

// 建立成就項目按鈕
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
const createSuggestionSongCard = (gainList) => {
    let songs = [];
    if (gainList === true || gainList === false) {
        songs = songFilter(data.songs, { isNewVersion: gainList });
    } else {
        const { minLevel, maxLevel } = calculateLevelRange(gainList.level);
        songs = songFilter(data.songs, { isNewVersion: gainList.isNewVersion, minLevel: minLevel, maxLevel: maxLevel });
    }

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
            <div class="col-12 d-flex align-items-center my-3 p-0">
                <div class="section-divider"></div>
                <b class="px-3">${level}</b>
                <div class="section-divider"></div>
            </div>`;

        const cards = songList.map(song => {
            const currentRating = calculateSongRating(song);
            const selectedThreshold = $('input[name="rating-threshold"]:checked').val();
            let matchingSuggestion = [];
            if (gainList === true || gainList === false) {
                matchingSuggestion = gainListAll.find(s => s.level === song.internalLevel && (s.isNewVersion === gainList));
            } else {
                matchingSuggestion = gainListAll.find(s => s.level === song.internalLevel && (s.isNewVersion === gainList.isNewVersion));
            }
            if (!matchingSuggestion) return null;
            const matchingUpgrade = matchingSuggestion.upgrades.find(upg => upg.rank === selectedThreshold);
            if (!matchingUpgrade) return null;

            const targetRating = matchingUpgrade.rating;
            const gain = matchingUpgrade.gain;
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
        handlePlayedFilters();
    });
}

// 查找符合條件的建議項目
const findMatchingSuggestion = (displayLevel, isNewVersion) => {
    return gainListAll.find(s => {
        const baseLevel = Math.floor(s.level);
        const decimal = s.level - baseLevel;
        const groupKey = decimal < 0.6 ? baseLevel.toString() : `${baseLevel}+`;
        return groupKey === displayLevel && s.isNewVersion === isNewVersion;
    });
}
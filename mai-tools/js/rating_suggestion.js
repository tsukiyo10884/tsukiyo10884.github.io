let suggestions = [];
let selectedRatingThreshold = null;
let groupedNewSongs = {};
let groupedOldSongs = {};

const createElement = (tag, className, text) =>
    $(`<${tag}>`).addClass(className).text(text);


async function initRatingSuggestionList() {
    suggestions = suggestPotentialUpgrades(data.songs, getTop50Songs());
    groupedNewSongs = groupSongs(suggestions, true);
    groupedOldSongs = groupSongs(suggestions, false);
    const $newSongsSection = createSection('new songs');
    const $oldSongsSection = createSection('others');

    $('#song-table').empty().append($newSongsSection, $oldSongsSection);
    $('#stat').empty();
    bindRatingThresholdEventListeners();
}

const groupSongs = (songs, isNewVersion) => {
    return songFilter(songs, { is_new_version: isNewVersion }).reduce((acc, song) => {
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

const calculateLevelRange = (level) => {
    const baseLevel = Math.floor(level);
    const decimal = level - baseLevel;
    const minLevel = decimal < 0.6 ? baseLevel : baseLevel + 0.6;
    const maxLevel = decimal < 0.6 ? baseLevel + 0.5 : baseLevel + 0.9;
    return { minLevel, maxLevel };
};

const suggestPotentialUpgrades = (allSongs, top50Songs) => {
    const newSongs = songFilter(allSongs, { is_new_version: true });
    const oldSongs = songFilter(allSongs, { is_new_version: false });
    const newTopSongs = songFilter(top50Songs, { is_new_version: true });
    const oldTopSongs = songFilter(top50Songs, { is_new_version: false });

    const newMinRating = Math.min(...newTopSongs.map(s => calculateSongRating(s)));
    const oldMinRating = Math.min(...oldTopSongs.map(s => calculateSongRating(s)));

    const newSuggestions = calculateSuggestions(newSongs, newMinRating, currentVersion);
    const oldSuggestions = calculateSuggestions(oldSongs, oldMinRating, 'others');

    return [...newSuggestions, ...oldSuggestions].sort((a, b) => parseFloat(a.level) - parseFloat(b.level));
}

const calculateSuggestions = (songs, minRating, version) => {
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
            upgrades,
            version_international: version
        };
    }).filter(item => item.upgrades.some(upg => upg.gain !== '+0'));
}

const createSection = (title) => {
    const $section = $('<div>');
    const $title = createElement('div', 'section-title text-shadow-black', title);
    const $buttonsContainer = $('<div>').addClass('level-buttons-container mb-3 text-center row');

    const groupedSongs = title === 'new songs' ? groupedNewSongs : groupedOldSongs;

    Object.entries(groupedSongs)
        .sort(([a], [b]) => {
            const aNum = parseFloat(a);
            const bNum = parseFloat(b);
            return aNum - bNum;
        })
        .forEach(([groupKey, groupSongs]) => {
            $buttonsContainer.append(createLevelButton(groupSongs[0], groupKey));
        });

    return $section.append($title, $buttonsContainer);
};

const createLevelButton = (suggestion, displayLevel) => {
    return $('<button>')
        .addClass('me-2 col-1 mb-2')
        .text(displayLevel)
        .on('click', () => showLevelDetails(suggestion));
}

const showLevelDetails = (suggestion) => {
    const $songGrid = createSuggestionSongCard(suggestion);

    const level = suggestion.level;
    const baseLevel = Math.floor(level);
    const decimal = level - baseLevel;
    const displayLevel = decimal < 0.6 ? baseLevel : `${baseLevel}+`;

    const $title = createElement('div', 'section-title text-shadow-black', `等級${displayLevel}候選曲(${suggestion.version_international === currentVersion ? '新曲' : '舊曲'})`);
    $('#now-title').text(`rating_suggestion|${displayLevel}|${suggestion.version_international === currentVersion}`);

    const $radioContainer = $('<div>').addClass('row g-4');
    const $radioCol1 = $('<div>').addClass('col-auto');
    const $radioCol2 = $('<div>').addClass('col-auto');

    if (selectedRatingThreshold === null) {
        selectedRatingThreshold = 'SSS+';
    }

    for (let i = 0; i < SCORE_THRESHOLDS.length; i += 2) {
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

    $('#song-table').empty().append($title, $songGrid);
    $('#stat').empty().append($('<div class="d-flex align-items-center h-100">').append($radioContainer));
    bindRatingThresholdEventListeners();

    if (selectedRatingThreshold) {
        changeRatingThreshould();
    }
}

const createSuggestionSongCard = (suggestion) => {
    const { minLevel, maxLevel } = calculateLevelRange(suggestion.level);
    const isNewVersion = suggestion.version_international === currentVersion;

    let songs = data.songs.filter(song => {
        const songLevel = song.internalLevel;
        return songLevel >= minLevel && songLevel <= maxLevel;
    });
    songs = songFilter(songs, { is_new_version: isNewVersion });
    songs.sort((a, b) => b.internalLevel - a.internalLevel);

    const songCards = songs.map(song => {
        const currentRating = calculateSongRating(song);

        const selectedThreshold = $('input[name="rating-threshold"]:checked').val();
        const matchingSuggestion = suggestions.find(s => s.level === song.internalLevel && (isNewVersion ? s.version_international === currentVersion : s.version_international === 'others'));
        if (!matchingSuggestion) {
            return null;
        }
        const matchingUpgrade = matchingSuggestion.upgrades.find(upg => upg.rank === selectedThreshold);
        if (!matchingUpgrade) {
            return null;
        }
        const targetRating = matchingUpgrade.rating;
        const gain = matchingUpgrade.gain;

        song.targetRating = targetRating;
        song.ratingGain = gain;

        if (gain === '+0' || currentRating >= targetRating) {
            return null;
        }
        return createSquareSongCard(song, { isPlayed: song.score !== '0.0000%' });
    }).filter(card => card !== null).join('');

    if (!songCards) {
        return $('<div>').addClass('square-song-grid col-12 row ms-0 text-center').html('<div class="col-12 py-5">無</div>');
    }

    return $('<div>').addClass('square-song-grid col-12 row ms-0').html(songCards);
}

const findMatchingSuggestion = (displayLevel, isNewVersion) => {
    return suggestions.find(s => {
        const baseLevel = Math.floor(s.level);
        const decimal = s.level - baseLevel;
        const groupKey = decimal < 0.6 ? baseLevel.toString() : `${baseLevel}+`;
        return groupKey === displayLevel && s.version_international === (isNewVersion ? currentVersion : 'others');
    });
}

const changeRatingThreshould = () => {
    const now = $('#now-title').text().trim();
    const type = now.split('|')[0];
    if (type === 'rating_suggestion') {
        const displayLevel = now.split('|')[1];
        const isNewVersion = now.split('|')[2];
        const matchingSuggestion = findMatchingSuggestion(displayLevel, isNewVersion === 'true');
        if (matchingSuggestion) {
            const $songGrid = createSuggestionSongCard(matchingSuggestion);
            $('#song-table').find('.square-song-grid').replaceWith($songGrid);
        }
    }
}

const bindRatingThresholdEventListeners = () => {
    $('input[name="rating-threshold"]').off('change');
    $('input[name="rating-threshold"]').on('change', function () {
        selectedRatingThreshold = $(this).val();
        changeRatingThreshould();
    });
}

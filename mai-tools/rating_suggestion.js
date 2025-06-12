const RATING_THRESHOLDS = [
    { name: 'S', score: 97.00 },
    { name: 'S+', score: 98.00 },
    { name: 'SS', score: 99.00 },
    { name: 'SS+', score: 99.50 },
    { name: 'SSS', score: 100.00 },
    { name: 'SSS+', score: 100.50 }
];
let suggestions = [];
let selectedRatingThreshold = null;

const createElement = (tag, className, text) =>
    $(`<${tag}>`).addClass(className).text(text);


async function initRatingSuggestionList() {
    suggestions = suggestPotentialUpgrades(data.songs, getTop50Songs());
    const newSongs = suggestions.filter(s => s.version_international === currentVersion);
    const oldSongs = suggestions.filter(s => s.version_international !== currentVersion);

    const $newSongsSection = createSection('new songs', newSongs);
    const $oldSongsSection = createSection('others', oldSongs);

    $('#song-table').empty().append($newSongsSection, $oldSongsSection);
    $('#stat').empty();
    bindSuggestionThresholdEventListeners();
}

const filterByVersion = (songs, isNewVersion) =>
    songs.filter(s => (s.version_international === currentVersion) === isNewVersion);

const calculateLevelRange = (level) => {
    const baseLevel = Math.floor(level);
    const decimal = level - baseLevel;
    const minLevel = decimal < 0.6 ? baseLevel : baseLevel + 0.6;
    const maxLevel = decimal < 0.6 ? baseLevel + 0.5 : baseLevel + 0.9;
    return { minLevel, maxLevel };
};

function suggestPotentialUpgrades(allSongs, top50Songs) {
    const newSongs = filterByVersion(allSongs, true);
    const oldSongs = filterByVersion(allSongs, false);
    const newTopSongs = filterByVersion(top50Songs, true);
    const oldTopSongs = filterByVersion(top50Songs, false);

    const newMinRating = Math.min(...newTopSongs.map(s => calculateSongRating(s)));
    const oldMinRating = Math.min(...oldTopSongs.map(s => calculateSongRating(s)));

    const newSuggestions = calculateSuggestions(newSongs, newMinRating, RATING_THRESHOLDS, currentVersion);
    const oldSuggestions = calculateSuggestions(oldSongs, oldMinRating, RATING_THRESHOLDS, 'others');

    return [...newSuggestions, ...oldSuggestions].sort((a, b) => parseFloat(a.level) - parseFloat(b.level));
}

function calculateSuggestions(songs, minRating, thresholds, version) {
    const groupedByLevel = songs.reduce((acc, song) => {
        if (!acc[song.internalLevel]) acc[song.internalLevel] = [];
        acc[song.internalLevel].push(song);
        return acc;
    }, {});

    return Object.entries(groupedByLevel).map(([level, _]) => {
        const lv = Number(level);
        const upgrades = thresholds.map(({ name, score }) => {
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

const createSection = (title, songs) => {
    const $section = $('<div>');
    const $title = createElement('div', 'section-title text-shadow-black', title);
    const $buttonsContainer = $('<div>').addClass('level-buttons-container mb-3 text-center row');

    const groupedSongs = songs.reduce((acc, song) => {
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

function createLevelButton(suggestion, displayLevel) {
    return $('<button>')
        .addClass('me-2 col-1 mb-2')
        .text(displayLevel)
        .on('click', () => showLevelDetails(suggestion));
}

function showLevelDetails(suggestion) {
    const $songGrid = createSuggestionSongCard(suggestion);

    const level = suggestion.level;
    const baseLevel = Math.floor(level);
    const decimal = level - baseLevel;
    const displayLevel = decimal < 0.6 ? baseLevel : `${baseLevel}+`;

    const $title = createElement('div', 'section-title text-shadow-black', `等級${displayLevel}推薦曲(${suggestion.version_international === currentVersion ? '新曲' : '舊曲'})`);

    const $radioContainer = $('<div>').addClass('row g-4');
    const $radioCol1 = $('<div>').addClass('col-auto');
    const $radioCol2 = $('<div>').addClass('col-auto');

    if (selectedRatingThreshold === null) {
        selectedRatingThreshold = 'SSS+';
    }

    for (let i = 0; i < RATING_THRESHOLDS.length; i += 2) {
        const $radio1 = $('<div>').addClass('form-check');
        const $input1 = $('<input>')
            .addClass('form-check-input')
            .attr('type', 'radio')
            .attr('name', 'rating-threshold')
            .attr('id', `threshold-${RATING_THRESHOLDS[i].name}`)
            .attr('value', RATING_THRESHOLDS[i].name)
            .prop('checked', selectedRatingThreshold === RATING_THRESHOLDS[i].name);
        const $label1 = $('<label>')
            .addClass('form-check-label')
            .attr('for', `threshold-${RATING_THRESHOLDS[i].name}`)
            .text(RATING_THRESHOLDS[i].name);
        $radio1.append($input1, $label1);
        $radioCol1.append($radio1);

        if (i + 1 < RATING_THRESHOLDS.length) {
            const $radio2 = $('<div>').addClass('form-check');
            const $input2 = $('<input>')
                .addClass('form-check-input')
                .attr('type', 'radio')
                .attr('name', 'rating-threshold')
                .attr('id', `threshold-${RATING_THRESHOLDS[i + 1].name}`)
                .attr('value', RATING_THRESHOLDS[i + 1].name)
                .prop('checked', selectedRatingThreshold === RATING_THRESHOLDS[i + 1].name);
            const $label2 = $('<label>')
                .addClass('form-check-label')
                .attr('for', `threshold-${RATING_THRESHOLDS[i + 1].name}`)
                .text(RATING_THRESHOLDS[i + 1].name);
            $radio2.append($input2, $label2);
            $radioCol2.append($radio2);
        }
    }

    $radioContainer.append($radioCol1, $radioCol2);

    $('#song-table').empty().append($title, $songGrid);
    $('#stat').empty().append($('<div class="d-flex align-items-center h-100">').append($radioContainer));
    bindSuggestionThresholdEventListeners();
    
    if (selectedRatingThreshold) {
        handleSuggestionUpdate();
    }
}

function createSuggestionSongCard(suggestion) {
    const { minLevel, maxLevel } = calculateLevelRange(suggestion.level);
    const isNewVersion = suggestion.version_international === currentVersion;

    let songs = data.songs.filter(song => {
        const songLevel = song.internalLevel;
        return songLevel >= minLevel && songLevel <= maxLevel;
    });

    songs = filterByVersion(songs, isNewVersion);
    songs.sort((a, b) => b.internalLevel - a.internalLevel);

    const songCards = songs.map(song => {
        const currentRating = calculateSongRating(song);
        const diffClass = song.difficulty.replace(" ", "-").toLowerCase();

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

        return `
        <div class="col-1 plate-song-card difficulty-${diffClass}" 
             style="background-image: url('${song.image}');" 
             onclick="showSongDetail('${song.title}', '${song.type}')">
            <div class="song-overlay"></div>
            <div class="song-content text-shadow-black f_10 plate-song-title">${song.title}</div>
            <div class="song-content text-shadow-black f_10">${song.internalLevel ? Number.parseFloat(song.internalLevel).toFixed(1) : ''} | ${song.type.toUpperCase()}</div>
            <div class="song-content text-shadow-black">${song.score}</div>
            <div class="rating-gain-info text-shadow-black" >${song.targetRating ? `${song.targetRating}(${song.ratingGain})` : ''}</div>
        </div>`;
    }).filter(card => card !== null).join('');

    if (!songCards) {
        return $('<div>').addClass('square-song-grid col-12 row ms-0 text-center').html('<div class="col-12 py-5">無</div>');
    }

    return $('<div>').addClass('square-song-grid col-12 row ms-0').html(songCards);
}

function findMatchingSuggestion(displayLevel, isNewVersion) {
    return suggestions.find(s => {
        const baseLevel = Math.floor(s.level);
        const decimal = s.level - baseLevel;
        const groupKey = decimal < 0.6 ? baseLevel.toString() : `${baseLevel}+`;
        return groupKey === displayLevel && s.version_international === (isNewVersion ? currentVersion : 'others');
    });
}

function handleSuggestionUpdate() {
    const $input = $('#song-table .section-title').text().trim();
    const match = $input.match(/^等級\s*(\d+(?:\+)?)\s*推薦曲\s*\((新曲|舊曲)\)$/);
    if (match) {
        const displayLevel = match[1];
        const isNewVersion = match[2] === '新曲';
        const matchingSuggestion = findMatchingSuggestion(displayLevel, isNewVersion);
        if (matchingSuggestion) {
            const $songGrid = createSuggestionSongCard(matchingSuggestion);
            $('#song-table').find('.square-song-grid').replaceWith($songGrid);
        }
    }
}

function bindSuggestionThresholdEventListeners() {
    $('input[name="rating-threshold"]').off('change');
    $('input[name="rating-threshold"]').on('change', function () {
        selectedRatingThreshold = $(this).val();
        handleSuggestionUpdate();
    });
}

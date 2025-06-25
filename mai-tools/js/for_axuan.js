const initForAXuanList = () => {
    suggestions = suggestPotentialUpgrades(data.songs, getTop50Songs());
    const $songsSection = createSectionXuan(suggestions);

    $('#song-table').empty().append($songsSection);
    $('#stat').empty();
    $('#stat').removeClass('ayo');
    $('#stat').addClass('axuan');
    bindSuggestionThresholdEventListenersXuan();
    $('.basic_block').hide();
    $('#axuan_profile')?.remove();
    $('#ayo_profile')?.remove();
    const $profile = $('<img id="axuan_profile">')
        .attr('src', 'img/axuan_profile.png')
        .attr('style', 'position: relative;z-index:99;width: 422px;')
        .on('click', function () {
            $('.basic_block').show();
            $profile.remove();
        });
    $('#user-info').append($profile);

}

const createSectionXuan = (songs) => {
    const $section = $('<div>');
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
            $buttonsContainer.append(createLevelButtonXuan(groupSongs[0], groupKey));
        });

    return $section.append($buttonsContainer);
};
const createLevelButtonXuan = (suggestion, displayLevel) => {
    return $('<button>')
        .addClass('me-2 col-1 mb-2')
        .text(displayLevel)
        .on('click', () => showLevelDetailsXuan(suggestion));
}

const showLevelDetailsXuan = (suggestion) => {
    const $songGrid = createSuggestionSongCardXuan(suggestion);

    const level = suggestion.level;
    const baseLevel = Math.floor(level);
    const decimal = level - baseLevel;
    const displayLevel = decimal < 0.6 ? baseLevel : `${baseLevel}+`;

    const $title = createElement('div', 'section-title text-shadow-black', `等級${displayLevel}候選曲(不分新舊)`);
    $('#now-title').text(`axuan|${displayLevel}`);

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
    bindSuggestionThresholdEventListenersXuan();

    if (selectedRatingThreshold) {
        handleSuggestionUpdateXuan();
    }
}

const findMatchingSuggestionXuan = (displayLevel) => {
    return suggestions.find(s => {
        const baseLevel = Math.floor(s.level);
        const decimal = s.level - baseLevel;
        const groupKey = decimal < 0.6 ? baseLevel.toString() : `${baseLevel}+`;
        return groupKey === displayLevel;
    });
}


const createSuggestionSongCardXuan = (suggestion) => {
    const { minLevel, maxLevel } = calculateLevelRange(suggestion.level);

    let songs = data.songs.filter(song => {
        const songLevel = song.internalLevel;
        return songLevel >= minLevel && songLevel <= maxLevel;
    });

    songs.sort((a, b) => b.internalLevel - a.internalLevel);

    const songCards = songs.map(song => {
        const currentRating = calculateSongRating(song);

        const selectedThreshold = $('input[name="rating-threshold"]:checked').val();
        const matchingSuggestion = suggestions.find(s => s.level === song.internalLevel && (song.version_international === currentVersion ? s.version_international === currentVersion : s.version_international === 'others'));
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

const bindSuggestionThresholdEventListenersXuan = () => {
    $('input[name="rating-threshold"]').off('change');
    $('input[name="rating-threshold"]').on('change', function () {
        selectedRatingThreshold = $(this).val();
        handleSuggestionUpdateXuan();
    });
}

const handleSuggestionUpdateXuan = () => {
    const now = $('#now-title').text().trim();
    const mode = now.split('|')[0];
    if (mode === 'axuan') {
        const displayLevel = now.split('|')[1];
        const matchingSuggestion = findMatchingSuggestionXuan(displayLevel);
        if (matchingSuggestion) {
            const $songGrid = createSuggestionSongCardXuan(matchingSuggestion);
            $('#song-table').find('.square-song-grid').replaceWith($songGrid);
        }
    }
}
$(document).ready(function () {
    let clickCount = 0;

    $('.user-info').on('click', function () {
        clickCount++;

        if (clickCount === 3) {
            createSpecialButtons();
        }
    });
});

function createSpecialButtons() {
    const $col0 = $('<div>').addClass('col-1');
    const $col1 = $('<div>').addClass('col-1');
    const $col2 = $('<div>').addClass('col-1');

    const $button1 = $('<button>')
        .html('<img src="img/axuan_icon.png" alt="阿瑄專屬" style="height: 50px;">')
        .css({
            'padding': '0px'
        })
        .attr('data-bs-toggle', 'tooltip')
        .attr('data-bs-placement', 'bottom')
        .attr('title', '阿瑄專屬')
        .on('click', aXuan);

    const $button2 = $('<button>')
        .html('<img src="img/ayo_icon.png" alt="阿幽專屬" style="height: 50px;">')
        .css({
            'padding': '0px'
        })
        .attr('data-bs-toggle', 'tooltip')
        .attr('data-bs-placement', 'bottom')
        .attr('title', '阿幽專屬')
        .on('click', aYo);

    $col1.append($button1);
    $col2.append($button2);
    $('#info').append($col0, $col1, $col2);

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}

function aXuan() {
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
function createLevelButtonXuan(suggestion, displayLevel) {
    return $('<button>')
        .addClass('me-2 col-1 mb-2')
        .text(displayLevel)
        .on('click', () => showLevelDetailsXuan(suggestion));
}

function showLevelDetailsXuan(suggestion) {
    const $songGrid = createSuggestionSongCardXuan(suggestion);

    const level = suggestion.level;
    const baseLevel = Math.floor(level);
    const decimal = level - baseLevel;
    const displayLevel = decimal < 0.6 ? baseLevel : `${baseLevel}+`;

    const $title = createElement('div', 'section-title text-shadow-black', `等級${displayLevel}推薦曲(不分新舊)`);

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
    bindSuggestionThresholdEventListenersXuan();

    if (selectedRatingThreshold) {
        handleSuggestionUpdateXuan();
    }
}

function bindSuggestionThresholdEventListenersXuan() {
    $('input[name="rating-threshold"]').off('change');
    $('input[name="rating-threshold"]').on('change', function () {
        selectedRatingThreshold = $(this).val();
        handleSuggestionUpdateXuan();
    });
}

function handleSuggestionUpdateXuan() {
    const $input = $('#song-table .section-title').text().trim();
    const match = $input.match(/^等級\s*(\d+(?:\+)?)\s*推薦曲\s*\((不分新舊)\)$/);
    if (match) {
        const displayLevel = match[1];
        const matchingSuggestion = findMatchingSuggestionXuan(displayLevel);
        if (matchingSuggestion) {
            const $songGrid = createSuggestionSongCardXuan(matchingSuggestion);
            $('#song-table').find('.square-song-grid').replaceWith($songGrid);
        }
    }
}

function findMatchingSuggestionXuan(displayLevel) {
    return suggestions.find(s => {
        const baseLevel = Math.floor(s.level);
        const decimal = s.level - baseLevel;
        const groupKey = decimal < 0.6 ? baseLevel.toString() : `${baseLevel}+`;
        return groupKey === displayLevel;
    });
}


function createSuggestionSongCardXuan(suggestion) {
    const { minLevel, maxLevel } = calculateLevelRange(suggestion.level);

    let songs = data.songs.filter(song => {
        const songLevel = song.internalLevel;
        return songLevel >= minLevel && songLevel <= maxLevel;
    });

    songs.sort((a, b) => b.internalLevel - a.internalLevel);

    const songCards = songs.map(song => {
        const currentRating = calculateSongRating(song);
        const diffClass = song.difficulty.replace(" ", "-").toLowerCase();

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

        return `
        <div class="col-1 square-song-card difficulty-${diffClass}" 
             style="background-image: url('${song.image}');" 
             onclick="showSongDetail('${song.title}', '${song.type}')">
            <div class="song-overlay"></div>
            <div class="song-content text-shadow-black square-song-title">${song.title}</div>
            <div class="song-content text-shadow-black square-song-inner-level">${song.internalLevel ? Number.parseFloat(song.internalLevel).toFixed(1) : ''} | ${song.type.toUpperCase()}</div>
            <div class="song-content text-shadow-black square-song-score">${song.score}</div>
            <div class="rating-gain-info text-shadow-black" >${song.targetRating ? `${song.targetRating}(${song.ratingGain})` : ''}</div>
        </div>`;
    }).filter(card => card !== null).join('');

    if (!songCards) {
        return $('<div>').addClass('square-song-grid col-12 row ms-0 text-center').html('<div class="col-12 py-5">無</div>');
    }

    return $('<div>').addClass('square-song-grid col-12 row ms-0').html(songCards);
}
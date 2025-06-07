const RATING_THRESHOLDS = [
    { name: 'S', score: 97.00 },
    { name: 'S+', score: 98.00 },
    { name: 'SS', score: 99.00 },
    { name: 'SS+', score: 99.50 },
    { name: 'SSS', score: 100.00 },
    { name: 'SSS+', score: 100.50 }
];

const createElement = (tag, className, text) =>
    $(`<${tag}>`).addClass(className).text(text);

const createSection = (title, songs) => {
    const $section = $('<div>');
    const $title = createElement('div', 'section-title text-shadow-black', title);
    const $buttonsContainer = $('<div>').addClass('level-buttons-container mb-3 text-center row');

    songs.forEach(suggestion => {
        $buttonsContainer.append(createLevelButton(suggestion));
    });

    return $section.append($title, $buttonsContainer);
};

function suggestPotentialUpgrades(allSongs, top50Songs) {
    const newSongs = allSongs.filter(s => s.version_international === currentVersion);
    const oldSongs = allSongs.filter(s => s.version_international !== currentVersion);
    const newTopSongs = top50Songs.filter(s => s.version_international === currentVersion);
    const oldTopSongs = top50Songs.filter(s => s.version_international !== currentVersion);

    const newMinRating = Math.min(...newTopSongs.map(s => calculateSongRating(s)));
    const oldMinRating = Math.min(...oldTopSongs.map(s => calculateSongRating(s)));

    const newSuggestions = calculateSuggestions(newSongs, newMinRating, RATING_THRESHOLDS, currentVersion);
    const oldSuggestions = calculateSuggestions(oldSongs, oldMinRating, RATING_THRESHOLDS, 'old');

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

function createLevelButton(suggestion) {
    return $('<button>')
        .addClass('me-2 col-1 mb-2')
        .text(`${suggestion.level.toFixed(1)}`)
        .on('click', () => showLevelDetails(suggestion));
}

function showLevelDetails(suggestion) {
    const $contentContainer = $('<div class="d-flex align-items-center">');
    const $table = createUpgradesTable(suggestion);
    const $songGrid = createSuggestionSongCard(suggestion);
    const $title = createElement('div', 'section-title text-shadow-black', `等級${suggestion.level.toFixed(1)}推薦曲`);

    $contentContainer.append($table);
    $('#stat').empty().append($contentContainer);
    $('#song-table').empty().append($title, $songGrid);
}

function createUpgradesTable(suggestion) {
    const $table = $('<table>');
    const $tbody = $('<tbody>');

    for (let i = 0; i < suggestion.upgrades.length; i += 2) {
        const $row = $('<tr>');
        $row.append(
            $('<td>').text('達到 ' + suggestion.upgrades[i].rank),
            $('<td class="ps-2">').text(`${suggestion.upgrades[i].rating}(${suggestion.upgrades[i].gain})`)
        );

        if (i + 1 < suggestion.upgrades.length) {
            $row.append(
                $('<td class="ps-3">').text('達到 ' + suggestion.upgrades[i + 1].rank),
                $('<td class="ps-2">').text(`${suggestion.upgrades[i + 1].rating}(${suggestion.upgrades[i + 1].gain})`)
            );
        } else {
            $row.append($('<td>'), $('<td>'));
        }

        $tbody.append($row);
    }

    return $table.append($tbody);
}

function createSuggestionSongCard(suggestion) {
    const songs = data.songs.filter(song => song.internalLevel === suggestion.level);

    const songCards = songs.map(song => {
        const maxRating = achi2rating_splashplus(song.internalLevel * 10, 1005000);
        const currentRating = calculateSongRating(song);
        const isCompleted = currentRating >= maxRating;
        const diffClass = song.difficulty.replace(" ", "-").toLowerCase();

        if (($('#completed-only').is(':checked') && !isCompleted) ||
            ($('#non-completed-only').is(':checked') && isCompleted)) {
            return null;
        }

        return `
            <div class="col-1 plate-song-card difficulty-${diffClass} ${isCompleted ? 'completed' : ''}" 
                 style="background-image: url('${song.image}');" 
                 onclick="showSongDetail('${song.title}', '${song.type}')">
                <div class="song-overlay"></div>
                <div class="song-content text-shadow-black f_10 plate-song-title">${song.title}</div>
                <div class="song-content text-shadow-black f_10">${song.internalLevel ? Number.parseFloat(song.internalLevel).toFixed(1) : ''} | ${song.type.toUpperCase()}</div>
                <div class="song-content text-shadow-black">${song.score}</div>
                ${isCompleted ? '<div class="completion-check"><b>✓</b></div>' : ''}
            </div>`;
    }).join('');

    return $('<div>').addClass('square-song-grid col-12 row ms-0').html(songCards);
}

async function initRatingSuggestionList() {
    const suggestions = suggestPotentialUpgrades(data.songs, getTop50Songs());
    const newSongs = suggestions.filter(s => s.version_international === currentVersion);
    const oldSongs = suggestions.filter(s => s.version_international !== currentVersion);

    const $newSongsSection = createSection('new songs', newSongs);
    const $oldSongsSection = createSection('others', oldSongs);

    $('#song-table').empty().append($newSongsSection, $oldSongsSection);
    $('#stat').empty();
    bindSuggestionEventListeners();
    console.log('test1');
}

function bindSuggestionEventListeners() {
    console.log('test2');
    $('#completed-only, #non-completed-only').on('change', function() {
        console.log('test3');
        const $input = $('#song-table .section-title').text().trim();
        const match = $input.match(/^等級\s*(\d+(?:\.\d+)?)\s*推薦曲$/);
        if (match) {
            const level = Number(match[1]);
            const suggestion = {
                level: level,
                upgrades: [],
                version_international: currentVersion
            };
            showLevelDetails(suggestion);
        }
    });
}
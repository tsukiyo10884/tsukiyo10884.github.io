async function initRatingList() {
    const topSongs = getTop50Songs();
    data.ratingSongList = {
        rating_new: topSongs.filter(s => s.version_international === currentVersion),
        rating_others: topSongs.filter(s => s.version_international !== currentVersion)
    };

    const { rating_new, rating_others } = data.ratingSongList;
    const allRatingSongs = [...rating_new, ...rating_others];
    
    const [newSongs, others, all] = [rating_new, rating_others, allRatingSongs].map(calcRatings);
    await renderRatingSummaryTable(newSongs, others, all);
    $('#song-table').html(await showRatingList());
}

async function showRatingList() {
    const { rating_new, rating_others } = data.ratingSongList;
    return [
        await createRatingSection('new songs', rating_new),
        await createRatingSection('others', rating_others)
    ].join('');
}

function getTop50Songs() {
    const [oldSongs, newSongs] = [
        data.songs.filter(s => s.version_international !== currentVersion),
        data.songs.filter(s => s.version_international === currentVersion)
    ].map(songs => songs.map(s => ({ ...s, rating: calculateSongRating(s) })));

    const sortByRating = (a, b) => b.rating - a.rating || parseFloat(b.score) - parseFloat(a.score);
    return [
        ...oldSongs.sort(sortByRating).slice(0, 35),
        ...newSongs.sort(sortByRating).slice(0, 15)
    ];
}

async function renderRatingSummaryTable(newSongs, others, all) {
    const getAvg = songs => (songs.reduce((sum, item) => sum + item.rating, 0) / songs.length).toFixed(2);
    
    const stats = [
        ['新譜面平均R值', getAvg(newSongs)],
        ['舊譜面平均R值', getAvg(others)],
        ['全譜面平均R值', getAvg(all)]
    ];

    const tableHtml = stats.map(([label, value]) => 
        `<tr><td>${label}</td><td class="ps-2">${value}</td></tr>`
    ).join('');

    $('#stat').html(`
        <div class="d-flex align-items-center">
            <table><tbody>${tableHtml}</tbody></table>
        </div>
    `);
}

async function createRatingSection(title, songs) {
    const ratedSongs = calcRatings(songs);
    return `
        <div class="section-title text-shadow-black">${title}</div>
        <div class="song-grid row ms-0">
            ${ratedSongs.map(createSongCard).join('')}
        </div>`;
}

const calcRatings = songs => songs.map(song => ({
    ...song,
    rating: calculateSongRating(song)
}));

const calculateSongRating = song => 
    achi2rating_splashplus(song.internalLevel * 10, parseFloat(song.score) * 10000);

function createSongCard(song) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    const { title, image, internalLevel, type, score, rating } = song;
    
    return `
    <div class="song-card difficulty-${diffClass}">
        <img src="${image}" class="song-image" alt="${title}" crossorigin="anonymous" />
        <div class="song-overlay"></div>
        <div class="block-song-name song-content text-shadow-black song-title">${title}</div>
        <div class="block-inner-level song-content text-shadow-black">${internalLevel ? Number.parseFloat(internalLevel).toFixed(1) : ''} | ${type.toUpperCase()}</div>
        <div class="block-score song-content text-shadow-black">${score}</div>
        <div class="block-rating song-content text-shadow-black">${rating}</div>
    </div>`;
}


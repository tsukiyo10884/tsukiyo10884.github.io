async function initRatingList() {
    const topSongs = getTop50Songs();
    data.ratingSongList = {
        rating_new: topSongs.filter(s => s.versionInternational === currentVersion),
        rating_others: topSongs.filter(s => s.versionInternational !== currentVersion)
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
        data.songs.filter(s => s.versionInternational !== currentVersion),
        data.songs.filter(s => s.versionInternational === currentVersion)
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
        ['新曲平均', getAvg(newSongs)],
        ['舊曲平均', getAvg(others)],
        ['總平均R値', getAvg(all)]
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
        <div class="section-title text-shadow-black">
            <div class="col-12 d-flex align-items-center my-3">
                <div class="section-divider"></div>
                <b class="px-3">${title}</b>
                <div class="section-divider"></div>
            </div>
        </div>
        <div class="song-grid row ms-0">
            ${ratedSongs.map(createSongCard).join('')}
        </div>`;
}

const calcRatings = songs => songs.map(song => ({
    ...song,
    rating: calculateSongRating(song)
}));

const calculateSongRating = song =>
    achi2rating_latest(song.internalLevel * 10, parseFloat(song.score) * 10000);

function createSongCard(song) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    const { title, image, internalLevel, type, score, rating } = song;

    if (rating === 0) {
        return '';
    }

    return `
    <div class="song-card difficulty-${diffClass} deg${Math.floor(Math.random() * 5)}">
        <img src="${image}" class="song-image" alt="${title}" crossorigin="anonymous" />
        <div class="song-overlay"></div>
        <div class="rating-block-song-title song-content text-shadow-black">${title}</div>
        <div class="rating-block-inner-level song-content text-shadow-black">${internalLevel ? Number.parseFloat(internalLevel).toFixed(1) : ''} | ${type.toUpperCase()}</div>
        <div class="rating-block-score song-content text-shadow-black">${score}</div>
        <div class="rating-block-rating song-content text-shadow-black deg${Math.floor(Math.random() * 5)}">${rating}</div>
        <div class="card-decoration"></div>
    </div>`;
}


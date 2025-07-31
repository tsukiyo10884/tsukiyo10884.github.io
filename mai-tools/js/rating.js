async function initRatingList() {
    const topSongs = getTop50Songs();
    data.ratingSongList = {
        rating_new: songFilter(topSongs, { isNewVersion: true }),
        rating_others: songFilter(topSongs, { isNewVersion: false })
    };

    const { rating_new, rating_others } = data.ratingSongList;
    const allRatingSongs = [...rating_new, ...rating_others];

    const [newSongs, others, all] = [rating_new, rating_others, allRatingSongs].map(calcRatings);
    await ratingAverageTable(newSongs, others, all);
    $('#song-table').html(await showRatingList());
    $('#now-title').text('rating');
}

async function showRatingList() {
    const { rating_new, rating_others } = data.ratingSongList;
    return [
        await createRatingSection('new songs', rating_new),
        await createRatingSection('others', rating_others)
    ].join('');
}

// 取得前50首歌
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

// 顯示R值平均
async function ratingAverageTable(newSongs, others, all) {
    const getAvg = songs => {
        const validSongs = songs.filter(song => song.score != "0.0000%");
        return validSongs.length
            ? (validSongs.reduce((sum, item) => sum + item.rating, 0) / validSongs.length).toFixed(2)
            : 0;
    };

    const stats = [
        ['新曲平均', getAvg(newSongs)],
        ['舊曲平均', getAvg(others)],
        ['總平均R値', getAvg(all)]
    ];

    const tableHtml = stats.map(([label, value]) =>
        `<tr><td>${label}</td><td class="ps-2">${value}</td></tr>`
    ).join('');

    $('#stat').html(`
        <div id="rating-stat" class="d-flex align-items-center">
            <table><tbody>${tableHtml}</tbody></table>
        </div>
    `);
}

// 建立R值表區域
async function createRatingSection(title, songs) {
    const ratedSongs = calcRatings(songs);
    return `
        <div class="col-12 d-flex align-items-center my-3">
            <div class="section-divider left"></div>
            <b class="px-3 section-divider-title">${title}</b>
            <div class="section-divider right"></div>
        </div>
        <div class="song-grid row ms-0">
            ${ratedSongs.map(createSongCard).join('')}
        </div>`;
}

// 計算總R值
const calcRatings = songs => songs.map(song => ({
    ...song,
    rating: calculateSongRating(song)
}));

// 計算單曲R值(by sgimera)
const calculateSongRating = song =>
    achi2rating_latest(song.internalLevel * 10, parseFloat(song.score) * 10000);

// 建立歌卡
function createSongCard(song) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    const { title, image, internalLevel, type, score, rating } = song;

    if (rating === 0) {
        return '';
    }

    const deg = Math.floor(Math.random() * 5)

    return `
    <div class="song-card difficulty-${diffClass} deg${deg}">
        <img src="${image}" class="song-image" alt="${title}" crossorigin="anonymous" />
        <div class="song-overlay"></div>
        <div class="song-info-block">
            <div class="rating-block-song-title song-content text-shadow-black">${title}</div>
            <div class="rating-block-inner-level song-content text-shadow-black">${internalLevel ? Number.parseFloat(internalLevel).toFixed(1) : ''} | ${type.toUpperCase()}</div>
            <div class="rating-block-score song-content text-shadow-black">${score}</div>
            <div class="rating-block-rating song-content text-shadow-black deg${deg}">${rating}</div>
        </div>
        <div class="card-decoration"></div>
    </div>`;
}


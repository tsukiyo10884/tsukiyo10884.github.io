async function initRatingList() {
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

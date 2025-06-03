async function initRatingList() {
    $('#song-table').html(await showRatingList());
    await renderRatingSummaryTable();
}

async function showRatingList() {
    const html = [
        await createRatingSection('new songs', data.ratingSongList.rating_new),
        await createRatingSection('others', data.ratingSongList.rating_others)
    ].join('');

    return html;
}

async function renderRatingSummaryTable() {
    const allRatingSongs = data.ratingSongList.rating_new.concat(data.ratingSongList.rating_others);

    const newSongs = calcRatings(data.ratingSongList.rating_new);
    const others = calcRatings(data.ratingSongList.rating_others);
    const all = calcRatings(allRatingSongs);

    const getAvg = songs => (songs.reduce((sum, item) => sum + item.rating, 0) / songs.length).toFixed(2);

    const rows = [
        `<tr><td>新譜面平均R值</td><td>:</td><td>${getAvg(newSongs)}</td></tr>`,
        `<tr><td>舊譜面平均R值</td><td>:</td><td>${getAvg(others)}</td></tr>`,
        `<tr><td>全譜面平均R值</td><td>:</td><td>${getAvg(all)}</td></tr>`
    ];

    $('#stat').html(`
        <div class="section-title d-flex align-items-center justify-content-center">
            <table>
                <tbody>${rows.join('')}</tbody>
            </table>
        </div>
    `);
}


async function createRatingSection(title, songs) {
    songs = calcRatings(songs);

    return `
        <div class="section-title">${title}</div>
        <div class="song-grid row ms-0">
            ${songs.map(createSongCard).join('')}
        </div>`;
}

function calcRatings(songs) {
    return songs.map(song => {
        const scoreFloat = parseFloat(song.score) / 100;
        const isSSSPlus = parseFloat(song.score) >= 100.5;
        const coefficient = isSSSPlus ? 22.4 : (ratingTable.find(rank => parseFloat(rank.score) <= parseFloat(song.score))?.coefficient || 0);
        const rating = Math.floor(song.internalLevel * coefficient * (isSSSPlus ? 1.005 : scoreFloat));
        return { ...song, rating };
    });
}

function createSongCard(song) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    return `
    <div class="song-card difficulty-${diffClass}">
        <img src="${song.image}" class="song-image" alt="${song.title}" crossorigin="anonymous" />
        <div class="song-overlay"></div>
        <div class="block-song-name song-content text-shadow song-title">${song.title}</div>
        <div class="block-inner-level song-content text-shadow">${song.internalLevel == null ? '' : Number.parseFloat(song.internalLevel).toFixed(1)} | ${song.type.toUpperCase()}</div>
        <div class="block-score song-content text-shadow">${song.score}</div>
        <div class="block-rating song-content text-shadow">${song.rating}</div>
    </div>`;
}


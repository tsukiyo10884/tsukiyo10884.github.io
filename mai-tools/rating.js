async function initRatingList() {
    const container = document.getElementById('song-table');
    container.innerHTML = await showRatingList()
}

async function showRatingList() {
    const html = [
        await createRatingSection('new songs', data.ratingSongList.rating_new),
        await createRatingSection('others', data.ratingSongList.rating_others)
    ].join('');
    return html;
}

async function createRatingSection(title, songs) {
    const ratingTable = await fetch('rating_count.json')
        .then(res => res.json());
    songs = calcRatings(songs, ratingTable);
    return `
        <div class="section-title">${title}</div>
        <div class="song-grid row" style="margin-left:0">
            ${songs.map(createSongCard).join('')}
        </div>`;
}

function calcRatings(songs, rankTable) {
    return songs.map(song => {
        const scoreFloat = parseFloat(song.score) / 100;
        const isSSSPlus = parseFloat(song.score) >= 100.5;
        const coefficient = isSSSPlus ? 22.4 : (rankTable.find(rank => parseFloat(rank.score) <= parseFloat(song.score))?.coefficient || 0);
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


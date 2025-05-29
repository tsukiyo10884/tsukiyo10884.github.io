function createRatingSection(title, songs) {
    return `
        <div class="section-title">${title}</div>
        <div class="song-grid">
            ${songs.map(createSongCard).join('')}
        </div>`;
}
function createSongCard(song, type) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    return `
    <div class="song-card ${diffClass}" style="background-image: url('${song.image}')">
        <div class="song-overlay"></div>
        <div class="block-inner-level song-content text-shadow">${song.internalLevel == null ? '' : Number.parseFloat(song.internalLevel).toFixed(1)}</div>
        <div class="block-type song-content text-shadow">${song.type.toUpperCase()}</div>
        <div class="block-song-name song-content text-shadow song-title">${song.title}</div>
        <div class="block-score song-content text-shadow">${song.score}</div>
    </div>`;
}
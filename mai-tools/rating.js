function createRatingSection(title, songs) {
    return `
        <div class="section-title">${title}</div>
        <div class="song-grid row" style="margin-left:0">
            ${songs.map(createSongCard).join('')}
        </div>`;
}
function createSongCard(song) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    return `
    <div class="song-card ${diffClass}" style="background-image: url('${song.image}')">
        <div class="song-overlay"></div>
        <div class="block-song-name song-content text-shadow song-title f_10">${song.title}</div>
        <div class="block-inner-level song-content text-shadow f_10">${song.internalLevel == null ? '' : Number.parseFloat(song.internalLevel).toFixed(1)} | ${song.type.toUpperCase()}</div>
        <div class="block-score song-content text-shadow">${song.score}</div>
    </div>`;
}
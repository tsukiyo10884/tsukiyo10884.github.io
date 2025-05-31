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
    <div class="song-card ${diffClass}" style="background-image: url('${song.image}')">
        <div class="song-overlay"></div>
        <div class="block-song-name song-content text-shadow song-title">${song.title}</div>
        <div class="block-inner-level song-content text-shadow">${song.internalLevel == null ? '' : Number.parseFloat(song.internalLevel).toFixed(1)} | ${song.type.toUpperCase()}</div>
        <div class="block-score song-content text-shadow">${song.score}</div>
        <div class="block-rating song-content text-shadow">${song.rating}</div>
    </div>`;
}

function updateWidth() {
    const grid = document.querySelector('.song-grid');
    const selectionTitles = document.querySelectorAll('.section-title');
    const userInfo = document.querySelector('.user-info');
    const rowWidth = getRowWidth(grid);

    selectionTitles.forEach(el => {
        el.style.width = rowWidth + 'px';
    });
    const style = window.getComputedStyle(userInfo);
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingRight = parseFloat(style.paddingRight);
    const totalPadding = paddingLeft + paddingRight;

    userInfo.style.width = (rowWidth - totalPadding) + 'px';

}

function getRowWidth(container) {
    if (!container) return 0;
    const items = Array.from(container.children);
    if (items.length === 0) return 0;

    const firstTop = items[0].offsetTop;
    const sameRowItems = items.filter(item => item.offsetTop === firstTop);

    const totalWidth = sameRowItems.reduce((sum, el) => {
        const style = window.getComputedStyle(el);
        const marginLeft = parseFloat(style.marginLeft);
        const marginRight = parseFloat(style.marginRight);
        return sum + el.getBoundingClientRect().width + marginLeft + marginRight;
    }, 0);

    const containerStyle = window.getComputedStyle(container);
    const gap = parseFloat(containerStyle.columnGap || containerStyle.gap || 0);

    const gapTotal = gap * (sameRowItems.length - 2);

    return totalWidth + gapTotal;
}

window.addEventListener('resize', updateWidth);

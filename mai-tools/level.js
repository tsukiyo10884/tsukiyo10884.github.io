function showLevelList() {
    return `
        <div class="level-list">
            <input type="number" id="level-start" placeholder="最低等級" />
            <span>~</span>
            <input type="number" id="level-end" placeholder="最高等級" />
            <button onclick="showLevelListByRange()">查詢</button>
        </div>
    `;
}

function showLevelListByRange() {
    const container = document.getElementById('song-table');
    container.style.display = 'flex';
    const startLevel = parseFloat(document.getElementById('level-start').value);
    const endLevel = parseFloat(document.getElementById('level-end').value);

    if (isNaN(startLevel) || isNaN(endLevel) || startLevel > endLevel || startLevel < 1 || endLevel > 15) {
        alert("等級範圍必須在 1 到 15 之間");
        return;
    }

    const songs = data.songs.filter(song => {
        return song.internalLevel >= startLevel && song.internalLevel <= endLevel;
    });

    const html = [
        `
        <div class="section-title">
            <b>${startLevel} ~ ${endLevel}進度</b>
        </div>
        <div class="plate-song-grid">
            ${songs.sort((a, b) => a.internalLevel - b.internalLevel)
            .map(song => createNamePlateSongCard(song)).join('')}
        </div>`,
    ].join('');
    container.innerHTML = html;
}

function createLevelSongCard(song) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    let isCompleted = false;

    return `
    <div class="plate-song-card ${diffClass} ${isCompleted ? 'completed' : ''}" style="background-image: url('${song.image}');" onclick="showSongDetail('${song.title}', '${song.type}')">
        <div class="song-overlay"></div>
        <div class="song-content text-shadow f_10 plate-song-title">${song.title}</div>
        <div class="song-content text-shadow f_10">${song.internalLevel == null ? '' : Number.parseFloat(song.internalLevel).toFixed(1)} | ${song.type.toUpperCase()}</div>
        <div class="song-content text-shadow">${song.score}</div>
        ${isCompleted ? '<div class="completion-check">✔</div>' : ''}
    </div>`;
}
function createNamePlateSongCard(song, type) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    let isCompleted = false;

    switch (type) {
        case '極':
            isCompleted = song.fc || song.fcp || song.ap || song.app || song.fs || song.fsp || song.fdx || song.fdxp;
        case '将':
            isCompleted = parseFloat(song.score) > 100;
            break;
        case '神':
            isCompleted = song.ap || song.app;
            break;
        case '舞舞':
            isCompleted = song.fdx;
            break;
    }

    return `
    <div class="plate-song-card difficulty-glow ${diffClass} ${isCompleted ? 'completed' : ''}" style="background-image: url('${song.image}');">
        <div class="song-overlay"></div>
        <div class="block-type song-content text-shadow" style="font-size:10px;">${song.type.toUpperCase()}</div>
        <div class="block-song-name song-content text-shadow" style="font-size:10px;">${song.title.substring(0, 30)}</div>
        <div class="block-score song-content text-shadow">${song.score}</div>
        ${isCompleted ? '<div class="completion-check">✔</div>' : ''}
    </div>`;
}

async function showPlateList() {
    const versionList = await fetch('version.json')
        .then(res => res.json());
    return `
        <div class="plate-list">
            ${versionList.map(version => `
            <button class="plate-button" onclick="showVersionButton('${version.versionName}','${version.plateName}')">
            ${version.plateName} (${version.versionName})
            </button><br/>
            `).join('')}
        </div>`;
}

function showVersionButton(versionName, plateName) {
    const container = document.getElementById('song-table');
    container.style.display = 'flex';
    const html = [
        createUserInfo(data.user),
        `
        <div class="section-title">${versionName} 進度</div>
        <div class="plate-button-group">
            <button class="plate-button" onclick="showPlateProgress('${versionName}', '極')">${plateName}極</button>
            <button class="plate-button" onclick="showPlateProgress('${versionName}', '将')">${plateName}将</button>
            <button class="plate-button" onclick="showPlateProgress('${versionName}', '神')">${plateName}神</button>
            <button class="plate-button" onclick="showPlateProgress('${versionName}', '舞舞')">${plateName}舞舞</button>
        </div>`,
    ].join('');
    container.innerHTML = html;
}

function showPlateProgress(versionName, type) {
    const container = document.getElementById('song-table');
    container.style.display = 'flex';
    const songs = data.songs.filter(song => song.version === versionName);
    var plateSongs = "";
    const html = [
        createUserInfo(data.user),
        `
        <div class="section-title">${versionName}進度</div>
        <div class="plate-song-grid">
            ${songs.reverse().map(song => createNamePlateSongCard(song, type)).join('')}
        </div>`,
    ].join('');
    container.innerHTML = html;
}
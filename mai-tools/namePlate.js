async function showPlateList() {
    const versionList = await fetch('version.json')
        .then(res => res.json());
    return `
        <div class="plate-list">
            ${versionList.map(version => `
        <button class="plate-button" onclick="showVersionButton('${version.versionName}','${version.plateName}')">
            ${version.plateName} (${version.versionName})
        </button>
        ${version.versionName.includes('PLUS') ? '<br/>' : ''}
        ${version.versionName.includes('FiNALE') ? '<br/>' : ''}
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
            <button class="plate-button" onclick="showPlateProgress('${versionName}', '極')">${plateName}極</button>`,
        (versionName == 'maimai ~ maimai PLUS') ? '' : `<button class="plate-button" onclick="showPlateProgress('${versionName}', '将')">${plateName}将</button>`,
        `
            <button class="plate-button" onclick="showPlateProgress('${versionName}', '神')">${plateName}神</button>
            <button class="plate-button" onclick="showPlateProgress('${versionName}', '舞舞')">${plateName}舞舞</button>
        </div>`,
    ].join('');
    container.innerHTML = html;
}

async function showPlateProgress(versionName, type) {
    const container = document.getElementById('song-table');
    container.style.display = 'flex';
    var songs = data.songs;
    const today = new Date();

    var removeList = await fetch('removed_song.json')
        .then(res => res.json());
    removeList.forEach(entry => {
        const removeDate = new Date(entry.remove_date);
        if (today > removeDate) {
            const removeTitles = entry.remove_songs.map(s => s.title);
            songs = songs.filter(song => !removeTitles.includes(song.title));
        }
    });

    if (versionName === 'maimai ~ maimai PLUS') {
        songs = songs
            .filter(song => song.version === 'maimai' || song.version === 'maimai PLUS');
    } else {
        songs = songs
            .filter(song => song.version === versionName);
    }
    const basicTotal = songs.filter(song => song.difficulty === 'basic').length;
    const advancedTotal = songs.filter(song => song.difficulty === 'advanced').length;
    const expertTotal = songs.filter(song => song.difficulty === 'expert').length;
    const masterTotal = songs.filter(song => song.difficulty === 'master').length;
    var basicCompleted = 0;
    var advancedCompleted = 0;
    var expertCompleted = 0;
    var masterCompleted = 0;
    filteredSongs = [];
    switch (type) {
        case '極':
            filteredSongs = songs.filter(song => song.fc || song.fcp || song.ap || song.app || song.fs || song.fsp || song.fdx || song.fdxp);
        case '将':
            filteredSongs = songs.filter(song => parseFloat(song.score) > 100);
            break;
        case '神':
            filteredSongs = songs.filter(song => song.ap || song.app);
            break;
        case '舞舞':
            filteredSongs = songs.filter(song => song.fdx);
            break;
    }
    basicCompleted = filteredSongs.filter(song => song.difficulty === 'basic').length;
    advancedCompleted = filteredSongs.filter(song => song.difficulty === 'advanced').length;
    expertCompleted = filteredSongs.filter(song => song.difficulty === 'expert').length;
    masterCompleted = filteredSongs.filter(song => song.difficulty === 'master').length;

    const html = [
        createUserInfo(data.user),
        `
        <div class="section-title">
            <b>${versionName}進度</b>
            <div class="difficulty-counts">
                <span class="difficulty-count"><b style="color:#0f0">BAS</b>: ${basicCompleted}/${basicTotal}</span>
                <span class="difficulty-count"><b style="color:#ff0">ADV</b>: ${advancedCompleted}/${advancedTotal}</span>
                <span class="difficulty-count"><b style="color:#f00">EXP</b>: ${expertCompleted}/${expertTotal}</span>
                <span class="difficulty-count"><b style="color:#a0f">MAS</b>: ${masterCompleted}/${masterTotal}</span>
            </div>
        </div>
        <div class="plate-song-grid">
            ${songs.reverse()
            .filter(song => song.difficulty !== "remaster")
            .map(song => createNamePlateSongCard(song, type)).join('')}
        </div>`,
    ].join('');
    container.innerHTML = html;
}

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
    <div class="plate-song-card difficulty-glow ${diffClass} ${isCompleted ? 'completed' : ''}" style="background-image: url('${song.image}');" onclick="showSongDetail('${song.title}', '${song.type}')">
        <div class="song-overlay"></div>
        <div class="song-content text-shadow f_10 plate-song-title">${song.title}</div>
        <div class="song-content text-shadow f_10">${song.internalLevel == null ? '' : Number.parseFloat(song.internalLevel).toFixed(1)} | ${song.type.toUpperCase()}</div>
        <div class="song-content text-shadow">${song.score}</div>
        ${isCompleted ? '<div class="completion-check">✔</div>' : ''}
    </div>`;
}

function showSongDetail(title, type) {
    window.open(`https://arcade-songs.zetaraku.dev/maimai/?title=${title}&types=${type}`, '_blank');
}
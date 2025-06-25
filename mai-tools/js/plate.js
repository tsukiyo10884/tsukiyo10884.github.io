async function initPlateList() {
    $('#song-table').html(showPlateList());
}
function showPlateList() {
    return `<div class="row g-2">${versionList.map(version => {
        const colClass = version.plateName === '真' || version.plateName === '舞' ? 'col-6' :
            version.plateName === '輝' ? 'col-12' :
                version.plateName === '覇者' ? null : 'col-3';

        if (version.plateName === '覇者') {
            return `<div class="col-6">
                <button class="w-100 plate-version-button" onclick="showPlateProgress('${version.versionName}', '覇者', '')">              
                    <span style="font-size: 16px;">${version.plateName}</span><br/>
                    <span style="font-size: 14px;">${version.versionName}</span>
                </button>
            </div>`;
        }

        return `<div class="${colClass}">
            <button class="w-100 plate-version-button" onclick="showVersionButton('${version.versionName}','${version.plateName}')">              
                <span style="font-size: 16px;">${version.plateName}</span><br/>
                <span style="font-size: 14px;">${version.versionName}</span>
            </button>
        </div>`;
    }).join('')}</div>`;
}

function showVersionButton(versionName, plateName) {
    const buttons = [
        `<div class="col-3"><button class="w-100" onclick="showPlateProgress('${versionName}', '極', '${plateName}')">${plateName}極</button></div>`,
        versionName === 'maimai ~ maimai PLUS'
            ? `<div class="col-3"><button class="w-100" disabled>※初代100%就AP，沒有真将</button></div>`
            : `<div class="col-3"><button class="w-100" onclick="showPlateProgress('${versionName}', '将', '${plateName}')">${plateName}将</button></div>`,
        `<div class="col-3"><button class="w-100" onclick="showPlateProgress('${versionName}', '神', '${plateName}')">${plateName}神</button></div>`,
        `<div class="col-3"><button class="w-100" onclick="showPlateProgress('${versionName}', '舞舞', '${plateName}')">${plateName}舞舞</button></div>`
    ];
    $('#song-table').html(`<div class="row">${buttons.join('')}</div>`);
}

async function showPlateProgress(versionName, type, plateName) {
    let songs = data.songs.filter(song => song.title !== '全世界共通リズム感テスト');
    const today = new Date();

    const removeList = await fetch('./json/removed_song.json').then(res => res.json());
    removeList.forEach(entry => {
        if (today > new Date(entry.remove_date)) {
            const removeTitles = entry.remove_songs.map(s => s.title);
            songs = songs.filter(song => !removeTitles.includes(song.title));
        }
    });

    if (versionName === 'maimai ~ maimai PLUS') {
        songs = songFilter(songs, { version_international: 'maimai' }).concat(songFilter(songs, { version_international: 'maimai PLUS' }));
    } else if (versionName === 'maimai ~ FiNALE') {
        const finaleIndex = versionOrder.indexOf('FiNALE');
        songs = songs.filter(song => versionOrder.indexOf(song.version_international) !== -1 &&
            versionOrder.indexOf(song.version_international) <= finaleIndex);
    } else {
        songs = songFilter(songs, { version_international: versionName });
    }

    const difficultyCounts = {
        basic: { total: 0, completed: 0 },
        advanced: { total: 0, completed: 0 },
        expert: { total: 0, completed: 0 },
        master: { total: 0, completed: 0 },
        remaster: { total: 0, completed: 0 }
    };

    songs.forEach(song => {
        if (song.difficulty in difficultyCounts) {
            difficultyCounts[song.difficulty].total++;
        }
    });

    const tips = {
        '極': '全曲/BASIC～MASTER/FULL COMBO',
        '将': '全曲/BASIC～MASTER/RANK SSS',
        '神': '全曲/BASIC～MASTER/ALL PERFECT',
        '舞舞': '全曲/BASIC～MASTER/FULL SYNC DX',
        '覇者': '全曲/BASIC～RE:MASTER/clear'
    }[type];

    const filteredSongs = songFilter(songs, { plate: type });

    filteredSongs.forEach(song => {
        if (song.difficulty in difficultyCounts) {
            difficultyCounts[song.difficulty].completed++;
        }
    });

    const difficultyTable = Object.entries(difficultyCounts)
        .filter(([diff, counts]) => {
            if (diff === 'remaster') {
                return versionName === 'maimai ~ FiNALE';
            }
            return counts.total > 0;
        })
        .map(([diff, counts]) => {
            const colors = {
                basic: '#81d955',
                advanced: '#f8b709',
                expert: '#ff818d',
                master: '#c346e7',
                remaster: '#fff'
            };
            const percentage = (counts.completed / counts.total * 100).toFixed(2);
            return `<tr>
                <td class="text-shadow-black" style="color:${colors[diff]}">${diff.toUpperCase().slice(0, 3)}</td>
                <td class="ps-2">${String(counts.completed).padStart(3, " ")}</td>
                <td>/</td>
                <td>${String(counts.total).padStart(3, " ")}</td>
                <td class="ps-2">=</td>
                <td class="ps-2">${percentage}%</td>
            </tr>`;
        }).join('');

    $('#stat').html(`
        <div class="difficulty-counts d-flex align-items-center">
            <table class="difficulty-table text-center">${difficultyTable}</table>
        </div>
    `);

    const displayTips = versionName === 'maimai ~ FiNALE' ? tips.replace('～MASTER/', '～RE:MASTER/') : tips;
    let diffGroup = [];
    songs.forEach(song => {
        if (!diffGroup.includes(song.difficulty)) {
            diffGroup.push(song.difficulty);
        }
    });
    diffGroup.sort((a, b) => difficulties.indexOf(b) - difficulties.indexOf(a));

    $('#now-title').text(`plate|${plateName}|${type}|${versionName}`);
    $('#song-table').html(`
        <div class="section-title text-shadow-black">
            <b id="plate-progress-title">${plateName}${type}(${versionName})進度</b>
            <div class="tips">${displayTips}</div>
        </div>
        ${diffGroup.map(diff => `
            ${diff === 'remaster' && versionName !== 'maimai ~ FiNALE' ? '' : `
                <div class="col-12">
                    <b id="plate-progress-title" class="d-flex justify-content-center mb-3">${diff}</b>
                </div>
                <div class="square-song-grid col-12 row ms-0 mb-3">
                    ${songs
                .sort((a, b) => b.internalLevel - a.internalLevel)
                .filter(song => song.difficulty === diff)
                .map(song => createNamePlateSongCard(song, type))
                .filter(Boolean)
                .join('')}
                </div>
            `}
        `).join('')}
    `);
}

function createNamePlateSongCard(song, type) {
    const isCompleted = {
        '極': () => song.fc || song.fcp || song.ap || song.app || song.fs || song.fsp || song.fdx || song.fdxp,
        '将': () => parseFloat(song.score) > 100,
        '神': () => song.ap || song.app,
        '舞舞': () => song.fdx,
        '覇者': () => parseFloat(song.score.replace('%', '')) >= 80
    }[type]();

    return createSquareSongCard(song, { isCompleted : isCompleted });
}

function showSongDetail(title, type) {
    window.open(`https://arcade-songs.zetaraku.dev/maimai/?title=${title}&types=${type}`, '_blank');
}
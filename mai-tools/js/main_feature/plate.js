const initPlateList = async () => {
    $('#song-table').html(showVersionButton());
}

// 顯示版本按鈕
const showVersionButton = () => {
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
            <button class="w-100 plate-version-button" onclick="showPlateButton('${version.versionName}','${version.plateName}')">              
                <span style="font-size: 16px;">${version.plateName}</span><br/>
                <span style="font-size: 14px;">${version.versionName}</span>
            </button>
        </div>`;
    }).join('')}</div>`;
}

// 顯示名牌版按鈕
const showPlateButton = async (versionName, plateName) => {
    const buttons = [
        `<div class="col"><button class="w-100" onclick="showPlateProgress('${versionName}', '極', '${plateName}')">${plateName}極</button></div>`,
        versionName === 'maimai ~ maimai PLUS'
            ? `<div class="col"><button class="w-100" disabled>不存在</button></div>`
            : `<div class="col"><button class="w-100" onclick="showPlateProgress('${versionName}', '将', '${plateName}')">${plateName}将</button></div>`,
        `<div class="col"><button class="w-100" onclick="showPlateProgress('${versionName}', '神', '${plateName}')">${plateName}神</button></div>`,
        `<div class="col"><button class="w-100" onclick="showPlateProgress('${versionName}', '舞舞', '${plateName}')">${plateName}舞舞</button></div>`
    ];
    const difficultyCounts1 = await getDifficultyCounts(null, versionName, { plate: '極' });
    const difficultyCounts2 = await getDifficultyCounts(null, versionName, { plate: '将' });
    const difficultyCounts3 = await getDifficultyCounts(null, versionName, { plate: '神' });
    const difficultyCounts4 = await getDifficultyCounts(null, versionName, { plate: '舞舞' });

    const allCounts = [
        difficultyCounts1,
        difficultyCounts2,
        difficultyCounts3,
        difficultyCounts4
    ];

    const colors = {
        basic: '#81d955',
        advanced: '#f8b709',
        expert: '#ff818d',
        master: '#c346e7',
        remaster: '#fff'
    };

    const summary = `
        <div class="pt-2"> 
            <div id="summary-table" >
                <table class="text-center">
                    <thead>
                        <tr>
                            <th></th>
                            <th colspan=3>${plateName}極</th>
                            <th colspan=3>${versionName === 'maimai ~ maimai PLUS' ? `-` : `${plateName}将`}</th>
                            <th colspan=3>${plateName}神</th>
                            <th colspan=3>${plateName}舞舞</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${difficulties.map(diff => {
        if (diff === 'remaster' && versionName !== 'maimai ~ FiNALE') return '';
        const isRemaster = diff === 'remaster' ? `text-shadow: 1px 1px 1px black, 1px -1px 1px black, -1px 1px 1px black, -1px -1px 1px black;` : ``;
        return `<tr>
            <td class="text-shadow-black difficulty-label" style="color:${colors[diff]};${isRemaster}">${diff.toUpperCase().slice(0, 3)}</td>
            ${allCounts.map(counts => {
            const c = counts[diff];
            return `${c ? `<td class="ps-2">${c.completed}</td><td>/</td><td>${c.total}</td>` : '-'}`;
        }).join('')}
            </tr>`;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    let tip = '';
    if (versionName === 'maimai ~ maimai PLUS') {
        tip = `<div class="col-9 text-center">※初代100%就AP，因此沒有真将</div>`;
    }
    $('#song-table').html(`${tip}<div class="row">${buttons.join('')}</div>`);
    $('#stat').html(`${summary}`);
}

// 顯示進度
const showPlateProgress = async (versionName, type, plateName) => {

    let songs = await getPlateSongs(versionName);
    const difficultyCounts = await getDifficultyCounts(songs, versionName, { plate: type });

    const tips = {
        '極': '全曲/BASIC～MASTER/FULL COMBO',
        '将': '全曲/BASIC～MASTER/RANK SSS',
        '神': '全曲/BASIC～MASTER/ALL PERFECT',
        '舞舞': '全曲/BASIC～MASTER/FULL SYNC DX',
        '覇者': '全曲/BASIC～RE:MASTER/clear'
    }[type];

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
            const isRemaster = diff === 'remaster' ? `text-shadow: 1px 1px 1px black, 1px -1px 1px black, -1px 1px 1px black, -1px -1px 1px black;` : ``;
            return `<tr>
                <td class="text-shadow-black" style="color:${colors[diff]};${isRemaster}">${diff.toUpperCase().slice(0, 3)}</td>
                <td class="ps-2">${String(counts.completed).padStart(3, " ")}</td>
                <td>/</td>
                <td>${String(counts.total).padStart(3, " ")}</td>
                <td class="ps-2">=</td>
                <td class="ps-2">${percentage}%</td>
            </tr>`;
        }).join('');

    $('#stat').html(`
        <div id="plate-stat" class="difficulty-counts d-flex align-items-center">
            <table class="difficulty-table text-center">${difficultyTable}</table>
        </div>
    `);

    const displayTips = versionName === 'maimai ~ FiNALE' ? tips.replace('～MASTER/', '～RE:MASTER/') : tips;
    let diffGroup = [];
    let nowDifficulties = difficulties.slice().reverse();
    if (versionName !== 'maimai ~ FiNALE') {
        nowDifficulties = nowDifficulties.slice(1);
    }
    nowDifficulties.forEach(diff => {
        diffGroup.push(songFilter(songs, { difficulty: diff }));
    })

    let $songGrid = [];
    // 分難度
    diffGroup.forEach((songs, diffIndex) => {
        let diffType = nowDifficulties[diffIndex];
        const collapseId = `diff-${diffType.toLowerCase()}`;

        // 分等級(.0~.6為一組，.6~.9為另一組)
        const groupedSongs = new Map();
        songs
            .sort((a, b) => b.internalLevel - a.internalLevel)
            .forEach(song => {
                const level = song.internalLevel;
                const baseLevel = Math.floor(level);
                const decimal = Math.round((level - baseLevel) * 10) / 10;
                const groupKey = decimal < 0.6 ? baseLevel.toString() : `${baseLevel}+`;
                if (!groupedSongs.has(groupKey)) groupedSongs.set(groupKey, []);
                groupedSongs.get(groupKey).push(song);
            });

        // 第一個分類預設展開，後面預設收起
        const isFirst = diffIndex === 0;
        const groupeHeader = `
            <div class="col-12">
                <div class="d-flex align-items-center my-3 collapse-toggle" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${isFirst}" role="button">
                    <b class="difficulty-collapse"><span class="collapse-icon" data-target="${collapseId}">${isFirst ? '－' : '＋'}</span> ${diffType.toUpperCase()}</b>
                </div>
                <div id="${collapseId}" class="collapse${isFirst ? ' show' : ''} row w-100 ms-0">
        `;

        const content = Array.from(groupedSongs)
            .map(([level, songList]) => {
                const levelHeader = `
                <div class="col-12 d-flex align-items-center my-2 p-0">
                    <div class="section-divider left"></div>
                    <b class="px-3 section-divider-title">${level}</b>
                    <div class="section-divider right"></div>
                </div>`;
                const cards = songList.map(song => {
                    return createNamePlateSongCard(song, type);
                }).filter(card => card !== null).join('');

                if (cards === '') return '';
                return `${levelHeader}<div class="square-song-grid col-12 row ms-0 mb-3 p-0">${cards}</div>`;
            }).join('');

        $songGrid.push(groupeHeader + content + '</div></div>');
    });


    const $title = $(`
    <div class="section-title text-shadow-black">
        <b id="plate-progress-title">${plateName}${type}(${versionName})進度</b>
        <div class="tips">${displayTips}</div>
    </div>`);
    $('#now-title').text(`plate|${plateName}|${type}|${versionName}`);
    $('#song-table').empty().append($title, $songGrid);

    $('.collapse').on('show.bs.collapse', function () {
        const id = $(this).attr('id');
        $(`.collapse-icon[data-target="${id}"]`).text('－');
    });
    $('.collapse').on('hide.bs.collapse', function () {
        const id = $(this).attr('id');
        $(`.collapse-icon[data-target="${id}"]`).text('＋');
    });
}

// 建立歌卡
const createNamePlateSongCard = (song, type) => {
    const isCompleted = {
        '極': () => song.fc || song.fcp || song.ap || song.app || song.fs || song.fsp || song.fdx || song.fdxp,
        '将': () => parseFloat(song.score) >= 100,
        '神': () => song.ap || song.app,
        '舞舞': () => song.fdx,
        '覇者': () => parseFloat(song.score.replace('%', '')) >= 80
    }[type]();

    return createSquareSongCard(song, { isCompleted: isCompleted });
}

// 計算各難度的達成數量
const getDifficultyCounts = async (songs, versionName, filter = null) => {
    if (songs == null) {
        songs = await getPlateSongs(versionName);
    }

    const counts = {
        basic: { total: 0, completed: 0 },
        advanced: { total: 0, completed: 0 },
        expert: { total: 0, completed: 0 },
        master: { total: 0, completed: 0 },
        remaster: { total: 0, completed: 0 }
    };

    songs.forEach(song => {
        if (song.difficulty in counts) {
            counts[song.difficulty].total++;
        }
    });

    const completedSongs = filter ? songFilter(songs, filter) : [];

    completedSongs.forEach(song => {
        if (song.difficulty in counts) {
            counts[song.difficulty].completed++;
        }
    });

    return counts;
}

// 取得該版本的歌曲
const getPlateSongs = async (versionName) => {
    let songs = data.songs.filter(song => song.title !== '全世界共通リズム感テスト');
    const today = new Date();

    let removeList = [];
    if ($('#version-switch').is(':checked')) {
        removeList = await fetch('./json/removed_song_jp.json').then(res => res.json());
    } else {
        removeList = await fetch('./json/removed_song_intl.json').then(res => res.json());
    }
    removeList.forEach(entry => {
        if (today > new Date(entry.remove_date)) {
            const removeTitles = entry.remove_songs.map(s => s.title);
            songs = songs.filter(song => !removeTitles.includes(song.title));
        }
    });

    if (versionName === 'maimai ~ maimai PLUS') {
        songs = songFilter(songs, { version: 'maimai' }).concat(songFilter(songs, { version: 'maimai PLUS' }));
    } else if (versionName === 'maimai ~ FiNALE') {
        const finaleIndex = versionOrder.indexOf('FiNALE');
        songs = songs.filter(song => versionOrder.indexOf(song.versionInternational) !== -1 &&
            versionOrder.indexOf(song.versionInternational) <= finaleIndex);
    } else {
        songs = songFilter(songs, { version: versionName });
    }

    return songs;
}
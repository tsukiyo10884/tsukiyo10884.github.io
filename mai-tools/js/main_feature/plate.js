// 難度顏色
const DIFFICULTY_COLORS = {
    basic: '#81d955',
    advanced: '#f8b709',
    expert: '#ff818d',
    master: '#c346e7',
    remaster: '#fff'
};

// 難度標籤的inline style(白色的remaster需要描邊)
const getDifficultyLabelStyle = (diff) => {
    const outline = diff === 'remaster'
        ? 'text-shadow: 1px 1px 1px black, 1px -1px 1px black, -1px 1px 1px black, -1px -1px 1px black;'
        : '';
    return `color:${DIFFICULTY_COLORS[diff]};${outline}`;
}

// 名牌種類(依顯示順序)
const PLATE_TYPES = ['極', '将', '神', '舞舞'];

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

// 顯示名牌板按鈕
const showPlateButton = async (versionName, plateName) => {
    const isFirstVersion = versionName === 'maimai ~ maimai PLUS';
    const buttons = PLATE_TYPES.map(type =>
        isFirstVersion && type === '将'
            ? `<div class="col"><button class="w-100" disabled>不存在</button></div>`
            : `<div class="col"><button class="w-100" onclick="showPlateProgress('${versionName}', '${type}', '${plateName}')">${plateName}${type}</button></div>`
    );

    const songs = await getPlateSongs(versionName);
    const allCounts = await Promise.all(
        PLATE_TYPES.map(type => getDifficultyCounts(songs, versionName, { plate: type }))
    );

    const summary = `
        <div class="pt-2"> 
            <div id="summary-table" >
                <table class="text-center">
                    <thead>
                        <tr>
                            <th></th>
                            ${PLATE_TYPES.map(type => `<th colspan=3>${isFirstVersion && type === '将' ? '-' : `${plateName}${type}`}</th>`).join('')}
                        </tr>
                    </thead>

                    <tbody>
                        ${difficulties.map(diff => {
                            if (diff === 'remaster' && versionName !== 'maimai ~ FiNALE') return '';
                            return `<tr>
                                <td class="text-shadow-black difficulty-label" style="${getDifficultyLabelStyle(diff)}">${diff.toUpperCase().slice(0, 3)}</td>
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
    if (isFirstVersion) {
        tip = `<div class="col-9 text-center">※初代100%就AP，因此沒有真将</div>`;
    }
    $('#song-table').html(`${summary}<hr/>${tip}<div class="row">${buttons.join('')}</div>`);
    $('#stat').html(``);
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
            const percentage = (counts.completed / counts.total * 100).toFixed(2);
            return `<tr>
                <td class="text-shadow-black" style="${getDifficultyLabelStyle(diff)}">${diff.toUpperCase().slice(0, 3)}</td>
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
                const groupKey = getLevelGroupKey(song.internalLevel);
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

}

// 展開/收合時切換 ＋/－ 圖示(事件委派，只需綁定一次)
$(document).on('show.bs.collapse hide.bs.collapse', '.collapse', function (event) {
    const id = $(this).attr('id');
    $(`.collapse-icon[data-target="${id}"]`).text(event.type === 'show' ? '－' : '＋');
});

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

// 刪除曲清單(依地區快取，避免重複下載)
const removedSongCache = {};
const getRemovedSongList = (region) => {
    if (!removedSongCache[region]) {
        removedSongCache[region] = fetch(`./json/removed_song_${region}.json`)
            .then(res => res.json())
            .catch(err => {
                delete removedSongCache[region];
                throw err;
            });
    }
    return removedSongCache[region];
}

// 取得該版本的歌曲
const getPlateSongs = async (versionName) => {
    let songs = generalData.songs.filter(song => song.title !== '全世界共通リズム感テスト');
    const today = new Date();

    const region = $('#version-switch').is(':checked') ? 'jp' : 'intl';
    const removeList = await getRemovedSongList(region);
    removeList.forEach(entry => {
        if (today > new Date(entry.removeDate)) {
            const removeTitles = entry.removeSongs.map(s => s.title);
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
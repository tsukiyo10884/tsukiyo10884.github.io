// 成就對應門檻
const SCORE_THRESHOLDS = [
    { name: 'clear', score: 80.00 },
    { name: 'S', score: 97.00 },
    { name: 'S+', score: 98.00 },
    { name: 'SS', score: 99.00 },
    { name: 'SS+', score: 99.50 },
    { name: 'SSS', score: 100.00 },
    { name: 'SSS+', score: 100.50 }
];

// 難度
const difficulties = ['basic', 'advanced', 'expert', 'master', 'remaster'];

// 初始化玩家資料
const initUserInfo = () => {
    $('#user-info').html(`
        <div class="basic_block p_10 f_0">
            <img id="user-icon" loading="lazy" class="w_112 f_l">
            <div class="p_l_10 f_l">
            <div id="user-trophy-block" class="trophy_block p_3 t_c f_0">
                <div class="trophy_inner_block f_13">
                <span id="user-trophy"></span>
                </div>
            </div>
            <div class="m_b_5">
                <div id="user-name" class="name_block f_l f_16"></div>
                <div class="f_r t_r f_0">
                <div class="p_r p_3">
                    <img id="user-rating-base" class="h_30 f_r">
                    <div id="user-rating" class="rating_block"></div>
                </div>
                </div>
                <div class="clearfix"></div>
            </div>
            <img src="https://wsrv.nl/?url=${encodeURIComponent("https://maimaidx-eng.com/maimai-mobile/img/line_01.png")}" class="user_data_block_line">
            <div class="clearfix"></div>
            <div class="row mb-1">
                <div id="div-user-course-rank-text" class="col-3">
                <h6>rank</h6>
                <span></span>
                </div>
                <div id="div-user-class-rank-text" class="col-3">
                <h6>class</h6>
                <span></span>
                </div>
                <div id="div-user-star-text" class="col-3">
                <h6>star</h6>
                <span></span>
                </div>
            </div>
            <img id="user-course-rank" class="h_35 f_l">
            <img id="user-class-rank" class="p_l_10 h_35 f_l">
            <div class="p_l_10 f_l f_14">
                <img class="h_30 m_3 v_m" src="https://wsrv.nl/?url=${encodeURIComponent("https://maimaidx-eng.com/maimai-mobile/img/icon_star.png")}"><span id="user-star"></span>
            </div>
            </div>
            <div class="clearfix"></div>
        </div>
        `);
    $('#user-trophy-block').attr('class', generalData.userInfo.userTrophyBlock + ' trophy_block p_3 t_c f_0');
    $('#user-trophy').text(generalData.userInfo.trophy);
    $('#user-name').text(generalData.userInfo.name);
    $('#user-rating').text(generalData.userInfo.rating);
    $('#user-rating-base').attr('src', "https://wsrv.nl/?url=" + encodeURIComponent(generalData.userInfo.ratingBase));
    $('#user-course-rank').attr('src', "https://wsrv.nl/?url=" + encodeURIComponent(generalData.userInfo.courseRank));
    $('#user-class-rank').attr('src', "https://wsrv.nl/?url=" + encodeURIComponent(generalData.userInfo.classRank));
    $('#div-user-star-text span').text('☆' + generalData.userInfo.star);
    $('#user-star').text(generalData.userInfo.star);
    $('#user-icon').attr('src', "https://wsrv.nl/?url=" + encodeURIComponent(generalData.userInfo.icon));
    $('#user-info').removeClass('d-none');

    let courseRankText = getProfileCourseText(generalData.userInfo.courseRankText);
    let classRankText = getProfileClassText(generalData.userInfo.classRankText);
    $('#div-user-course-rank-text span').text(courseRankText);
    $('#div-user-class-rank-text span').text(classRankText);
}

// 段位的圖片編號對應段位名稱
const getProfileCourseText = (courseRankText) => {
    switch (courseRankText) {
        case "00": return "初心者";
        case "01": return "初段";
        case "02": return "二段";
        case "03": return "三段";
        case "04": return "四段";
        case "05": return "五段";
        case "06": return "六段";
        case "07": return "七段";
        case "08": return "八段";
        case "09": return "九段";
        case "10": return "十段";
        case "12": return "真初段";
        case "13": return "真二段";
        case "14": return "真三段";
        case "15": return "真四段";
        case "16": return "真五段";
        case "17": return "真六段";
        case "18": return "真七段";
        case "19": return "真八段";
        case "20": return "真九段";
        case "21": return "真十段";
        case "22": return "真皆伝";
        case "23": return "裏皆伝";
    }
}

// class的圖片編號對應class名稱
const getProfileClassText = (classRankText) => {
    switch (classRankText) {
        case "00": return "B5";
        case "01": return "B4";
        case "02": return "B3";
        case "03": return "B2";
        case "04": return "B1";
        case "05": return "A5";
        case "06": return "A4";
        case "07": return "A3";
        case "08": return "A2";
        case "09": return "A1";
        case "10": return "S5";
        case "11": return "S4";
        case "12": return "S3";
        case "13": return "S2";
        case "14": return "S1";
        case "15": return "SS5";
        case "16": return "SS4";
        case "17": return "SS3";
        case "18": return "SS2";
        case "19": return "SS1";
        case "20": return "SSS5";
        case "21": return "SSS4";
        case "22": return "SSS3";
        case "23": return "SSS2";
        case "24": return "SSS1";
        case "25": return "LEGEND";
    }
}


// 段位認定的段位圖片編號對應段位名稱
const getRecordCourseText = (courseRankText) => {
    switch (courseRankText) {
        case "1001": return "初段";
        case "1002": return "二段";
        case "1003": return "三段";
        case "1004": return "四段";
        case "1005": return "五段";
        case "1006": return "六段";
        case "1007": return "七段";
        case "1008": return "八段";
        case "1009": return "九段";
        case "1010": return "十段";
        case "1101": return "真初段";
        case "1102": return "真二段";
        case "1103": return "真三段";
        case "1104": return "真四段";
        case "1105": return "真五段";
        case "1106": return "真六段";
        case "1107": return "真七段";
        case "1108": return "真八段";
        case "1109": return "真九段";
        case "1110": return "真十段";
        case "1121": return "真皆伝";
        case "1122": return "裏皆伝";
    }
}

// 顯示對應功能
const showTable = async (mode) => {
    $('#level-filter').hide();
    $('#stat').empty();
    $('#now-title').text('');

    const tableHandlers = {
        'overview': initOverview,
        'rating': initRatingList,
        'plate': initPlateList,
        'level': initLevelList,
        'suggestion': initSuggestionList,
        'course': initCourseList,
        'a_xuan': initForAXuanList,
        'a_yo': initForAyoList,
    };

    $('#div-completion-filters').toggleClass('d-none', !['plate', 'level'].includes(mode));
    $('#div-play-filters').toggleClass('d-none', !['suggestion', 'a_xuan'].includes(mode));
    $('#div-download-image').toggleClass('d-none', !['rating'].includes(mode));

    const handler = tableHandlers[mode];
    handler ? await handler() : $('#song-table').empty();
};

// 是否已遊玩過
const bindPlayedEventListeners = () => {
    $('#played-only, #non-played-only').on('change', function () {
        const $this = $(this);
        const $other = $this.attr('id') === 'played-only' ? $('#non-played-only') : $('#played-only');

        if ($this.is(':checked')) {
            $other.prop('checked', false);
        }
        handleFilterChange();
    });
}

// 是否已達成
const bindCompletionEventListeners = () => {
    $('#completed-only, #non-completed-only').on('change', function () {
        const $this = $(this);
        const $other = $this.attr('id') === 'completed-only' ? $('#non-completed-only') : $('#completed-only');

        if ($this.is(':checked')) {
            $other.prop('checked', false);
        }
        handleFilterChange();
    });
};

// 重新處理現在的資料
const handleFilterChange = () => {
    const now = $('#now-title').text().trim();
    const mode = now.split('|')[0];
    if (mode === 'plate') {
        const plateName = now.split('|')[1];
        const type = now.split('|')[2];
        const versionName = now.split('|')[3];
        showPlateProgress(versionName, plateName === '覇' ? '覇者' : type, plateName === '覇' ? '' : plateName);
    } else if (mode === 'level') {
        $('#level-start').val(now.split('|')[1]);
        $('#level-end').val(now.split('|')[2]);
        showLevelListByRange();
    } else if (mode === 'suggestion') {
        const displayLevel = now.split('|')[1];
        const versionTitle = now.split('|')[2];
        let isNewVersion = null;
        let gainChart = null;

        if (displayLevel === 'all') {
            if (versionTitle !== '不分新舊') {
                isNewVersion = versionTitle === '新曲';
            }
        }
        if (versionTitle !== '不分新舊') {
            isNewVersion = versionTitle === '新曲';
            gainChart = findMatchingSuggestion(displayLevel, isNewVersion);
        } else {
            gainChart = findMatchingSuggestion(displayLevel, null);
        }

        const $songGrid = createSuggestionSongCard(gainChart, isNewVersion);
        $('#song-table').find('.square-song-grid').replaceWith($songGrid);
    } else if (mode === 'rating') {
        initRatingList();
    } else if (mode === 'course') {
        showCourseProgress(now.split('|')[1]);
    }
};

const getTargetVersions = () => {
    const currentIdx = versionOrder.indexOf(currentVersion);
    const circleIdx = versionOrder.indexOf("CiRCLE");

    if (currentIdx >= 0) {
        if (circleIdx >= 0 && currentIdx >= circleIdx) {
            const startIdx = Math.max(0, currentIdx - 1);
            return versionOrder.slice(startIdx, currentIdx + 1);
        } else {
            return [versionOrder[currentIdx]];
        }
    }
    return versionOrder.slice(-2);
};

// 過濾歌曲
const songFilter = (songs, {
    isNewVersion = null,
    type = null,
    title = null,
    difficulty = null,
    version = null,
    internalLevel = null,
    minLevel = null,
    maxLevel = null,
    plate = null
} = {}) => {
    let result = songs;

    if (isNewVersion !== null && $('#version-switch').is(':checked')) {
        const targetVersions = getTargetVersions();
        result = result.filter(x => targetVersions.includes(x.versionJapan) === isNewVersion);
    } else if (isNewVersion !== null) {
        const targetVersions = getTargetVersions();
        result = result.filter(x => targetVersions.includes(x.versionInternational) === isNewVersion);
    }
    if (plate !== null) {
        result = result.filter(song => {
            switch (plate) {
                case '極': return song.fc || song.fcp || song.ap || song.app || song.fs || song.fsp || song.fdx || song.fdxp;
                case '将': return parseFloat(song.score) > 100;
                case '神': return song.ap || song.app;
                case '舞舞': return song.fdx;
                case '覇者': return parseFloat(song.score.replace('%', '')) >= 80;
                default: return false;
            }
        });
    }
    if (minLevel !== null && maxLevel !== null) {
        result = result.filter(song => {
            return song.internalLevel >= minLevel && song.internalLevel <= maxLevel;
        });
    }
    if (version !== null && $('#version-switch').is(':checked')) {
        result = result.filter(x => x.versionJapan === version);
    } else if (version !== null) {
        result = result.filter(x => x.versionInternational === version);
    }

    const filters = {
        type,
        title,
        difficulty,
        internalLevel
    };

    for (const [key, value] of Object.entries(filters)) {
        if (value !== null) {
            result = result.filter(x => x[key] === value);
        }
    }

    return result;
};

// 建立長形歌卡
function createSongCard(song) {
    const diffClass = song.difficulty.replace(" ", "-").toLowerCase();
    const { title, image, internalLevel, type, score, rating } = song;

    if (rating === 0) {
        return '';
    }

    const deg = Math.floor(Math.random() * 5)

    return `
    <div class="song-card difficulty-${diffClass} deg${deg}" onclick="showSongDetail('${song.title}', '${song.type}')">
        <img src="${image}" class="song-image" alt="${title}" crossorigin="anonymous" />
        <div class="song-overlay"></div>
        <div class="song-info-block">
            <div class="rating-block-song-title song-content text-shadow-black">${title}</div>
            <div class="rating-block-inner-level song-content text-shadow-black">${internalLevel ? Number.parseFloat(internalLevel).toFixed(1) : ''} | ${type.toUpperCase()}</div>
            <div class="rating-block-score song-content text-shadow-black">${score}</div>
            ${rating !== undefined ? `<div class="rating-block-rating song-content text-shadow-black deg${deg}">${rating}</div>` : ''}
        </div>
        <div class="card-decoration"></div>
    </div>`;
}

// 建立方形歌卡
const createSquareSongCard = (song, {
    isCompleted = null,
    isPlayed: isPlayed = null
} = {}) => {
    if (isCompleted !== null) {
        if (($('#completed-only').is(':checked') && !isCompleted) ||
            ($('#non-completed-only').is(':checked') && isCompleted)) {
            return null;
        }
    }
    if (isPlayed !== null) {
        if (($('#played-only').is(':checked') && !isPlayed) ||
            ($('#non-played-only').is(':checked') && isPlayed)) {
            return null;
        }
    }

    return `
        <div class="square-song-card difficulty-${song.difficulty.replace(" ", "-").toLowerCase()} ${isCompleted === true ? 'completed' : ''} deg${Math.floor(Math.random() * 5)}" 
                onclick="showSongDetail('${song.title}', '${song.type}')">
            <img src=${song.image} class="square-song-image" alt="${song.title}">
            <div class="song-overlay"></div>
            <div class="square-song-info-block">
                <div class="song-content text-shadow-black square-song-title">${song.title}</div>
                <div class="song-content text-shadow-black square-song-inner-level">${song.internalLevel ? Number.parseFloat(song.internalLevel).toFixed(1) : ''} | ${song.type.toUpperCase()}</div>
                <div class="song-content text-shadow-black square-song-score">${song.score}</div>
                ${isCompleted === true ? '<div class="completion-check"><b>✓</b></div>' : ''}
                ${isPlayed !== null ? `<div class="rating-gain-info text-shadow-black" >${song.targetRating ? `${song.targetRating}(${song.ratingGain})` : ''}</div>` : ''}
                <div class="card-decoration"></div>
            </div>
        </div>`;

}

// 點選可跳轉到arcade-songs
const showSongDetail = (title, type) => {
    title = encodeURIComponent(title);
    window.open(`https://arcade-songs.zetaraku.dev/maimai/?title=${title}&types=${type}`, '_blank');
}

// 如果等級是整數，則添加小數點和零
const formatLevel = (level) => {
    if (typeof level !== 'number' || isNaN(level)) {
        return '';
    }
    const str = level.toString();
    return str.includes('.') ? str : `${str}.0`;
};

// 計算等級範圍
const calculateLevelRange = (level) => {
    const baseLevel = Math.floor(level);
    const decimal = level - baseLevel;
    const minLevel = decimal < 0.6 ? baseLevel : baseLevel + 0.6;
    const maxLevel = decimal < 0.6 ? baseLevel + 0.5 : baseLevel + 0.9;
    return { minLevel, maxLevel };
};

// 初始化調色盤(切換style)
const cssFiles = [
    'css/translucent.css',
    'css/modern.css',
    'css/cute_pink.css',
    'css/cute_blue.css',
    'css/fabric_board.css',
    'css/default.css',
];
const initPalette = () => {
    $('#palette')
        .attr('data-bs-toggle', 'tooltip')
        .attr('data-bs-placement', 'bottom')
        .attr('data-bs-title', 'default');

    $('#palette').on('click', () => {
        const currentIndex = cssFiles.indexOf($('#theme').attr('href'));
        const nextIndex = (currentIndex + 1) % cssFiles.length;
        $('#theme').attr('href', cssFiles[nextIndex]);
        $('#palette')
            .attr('data-bs-title', cssFiles[nextIndex].replace('css/', '').replace('.css', ''))
            .tooltip('dispose')
            .tooltip()
            .tooltip('show');
    });
};

// 自己包Promise
const getJSON = (path) => {
    return new Promise((resolve, reject) => {
        $.getJSON(path, resolve).fail(reject);
    });
}

// 大大的Credit
const createCreditSection = () => {
    return `
    <div id="credit" class="mt-4 p-4 d-flex justify-content-center">
        <div class="row col-12" style="width: 915px;">
            <div class="col-6">
                <div class="row">
                    <div class="col-4">
                        <img src="img/ayo_credit_icon.svg" class="w-100">
                    </div>
                    <div class="col-8">
                        這是洪阿幽
                        <p class="f_10">This is Ayo</p>
                        這個小工具的功能規劃者之一
                        <p class="f_10">One of the planners of this tool</p>
                        也是推廣者
                        <p class="f_10">Also the promoter</p>
                        沒有給她Credit她會森77
                        <p class="f_10">If I don't give her credit, she will be angy</p>
                        <img src="img/ayo_angy.png" class="w-100"><br><br>
                        所以給她大大的Credit
                        <p class="f_10">So I give her a big credit</p>
                        她很棒，跟她說謝謝
                        <p class="f_10">She is great, say thank you to her</p>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="row mb-5">
                    <div class="col-4">
                        <img src="img/axuan_credit_icon.svg" class="w-100">
                    </div>
                    <div class="col-8">
                        這是簡阿瑄
                        <p class="f_10">This is Axuan</p>
                        這個小工具的功能規劃者之一
                        <p class="f_10">One of the planners of this tool</p>
                        她還有專屬小功能
                        <p class="f_10">She also has her own special features</p>
                        她很棒，跟她說謝謝
                        <p class="f_10">She is great, say thank you to her</p>
                    </div>
                </div>

                <div class="row">
                    <div class="col-4">
                        <img src="img/gua_credit_icon.svg" class="w-100">
                    </div>
                    <div class="col-8">
                        這是瓜
                        <p class="f_10">This is Gua</p>
                        這個小工具的QA之一
                        <p class="f_10">One of the QAs of this tool</p>
                        他很棒，跟他說謝謝
                        <p class="f_10">He is great, say thank you to him</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
}

$(document).ready(function () {
    $('.extra-credits').html(createCreditSection());
});

// 下載圖片功能
const downloadResultImage = () => {
    showLoading();

    setTimeout(() => {
        captureAndDownload();
    }, 100);

}
const captureAndDownload = () => {
    const element = document.querySelector('#result-container');
    const clone = element.cloneNode(true);

    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = parseFloat(window.getComputedStyle(element).width) + 40 + 'px';
    clone.style.padding = '20px';
    clone.style.paddingTop = '5px';
    clone.style.borderRadius = '10px';
    document.body.appendChild(clone);

    switch (cssFiles.indexOf($('#theme').attr('href'))) {
        case 0: // translucent
            clone.style.background = 'linear-gradient(0deg, #7af4c3, #7c81ff)';
            break;
        case 1: // modern
            clone.style.backgroundColor = '#232228';
            break;
        case 2: // cute_pink
            clone.style.backgroundColor = '#ffe4ec';
            break;
        case 3: // cute_blue
            clone.style.backgroundColor = '#e4f2ff';
            break;
        case 4: // fabric_board
            clone.style.background = 'url(../../mai-tools/img/fabric_board.jpg)';
            clone.style.backgroundSize = '300px';
            break;
        default:
            clone.style.backgroundColor = '#51bcf3';

    }
    html2canvas(clone, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: 'transparent',
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'maimai-' + $('#user-name').text() + '-' + new Date().toLocaleString().replace(/[/:\s]/g, '-') + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(clone);
        hideLoading();
    }).catch(err => {
        console.error('Screenshot failed:', err);
        alert('圖片下載失敗，請稍後再試。');
        document.body.removeChild(clone);
        hideLoading();
    });
};

// Loading畫面
const showLoading = () => {
    $("#loadingOverlay").removeClass("d-none");
}
const hideLoading = () => {
    $("#loadingOverlay").addClass("d-none");
}

// 上傳R值紀錄
const uploadRating = async () => {
    if (generalData.ratingHistory == null || generalData.ratingHistory.length === 0) {
        const toast = new bootstrap.Toast(document.getElementById('toast-no-data'), {
            delay: 2500
        });
        toast.show();
        return;
    }
    if (!confirm("上傳後紀錄為公開資料，確定繼續嗎？")) {
        return;
    }
    showLoading();

    const existingHistory = await fbTools.getUserHistory(generalData.userInfo.id);
    let proposedData = generalData.ratingHistory.filter(r => {
        return !existingHistory.some(e => e.rating === r.rating);
    });
    proposedData = proposedData.reduce((acc, current) => {
        const existing = acc.find(item => formatDate(new Date(item.record_date), 'yyyy/MM/dd') === formatDate(new Date(current.record_date), 'yyyy/MM/dd'));
        if (!existing) {
            acc.push(current);
        } else if (existing.rating < current.rating) {
            existing.rating = current.rating;
        }
        return acc;
    }, []);

    for (const r of proposedData) {
        await fbTools.uploadRating(generalData.userInfo.id, r.rating, r.record_date);
    }
    refreshData();
    hideLoading();
    const toast = new bootstrap.Toast(document.getElementById('toast-updated'), {
        delay: 2500
    });
    toast.show();
};

const triggerImport = () => {
    $('#input-file').click();
}
const importData = (file) => {
    if (file.files[0].type !== "application/json") {
        alert("請上傳JSON格式的檔案");
        return;
    }
    $('#div-test').addClass('d-none');
    window.postMessage({ type: 'init', payload: null }, '*');
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        $('#output').html(`<textarea id="json-data" class="d-none">${content}</textarea>`);
        refreshData();
    };
    reader.readAsText(file.files[0]);
}

// 將當前使用者資料匯出成JSON檔
const exportData = () => {
    const blob = new Blob([JSON.stringify(generalData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maimai-data-${generalData.userInfo.name}-${new Date().toLocaleString().replace(/[/:\s]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

const formatDate = (inputDate, format) => {
    if (!inputDate) return '';

    const padZero = (value) => (value < 10 ? `0${value}` : `${value}`);
    const parts = {
        yyyy: inputDate.getFullYear(),
        MM: padZero(inputDate.getMonth() + 1),
        dd: padZero(inputDate.getDate()),
        HH: padZero(inputDate.getHours()),
        hh: padZero(inputDate.getHours() > 12 ? inputDate.getHours() - 12 : inputDate.getHours()),
        mm: padZero(inputDate.getMinutes()),
        ss: padZero(inputDate.getSeconds()),
        tt: inputDate.getHours() < 12 ? 'AM' : 'PM'
    };

    return format.replace(/yyyy|MM|dd|HH|hh|mm|ss|tt/g, (match) => parts[match]);
}
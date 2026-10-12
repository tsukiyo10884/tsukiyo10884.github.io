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

// 段位名稱(初段~十段)
const DAN_NAMES = ['初段', '二段', '三段', '四段', '五段', '六段', '七段', '八段', '九段', '十段'];

// 段位的圖片編號對應段位名稱
const PROFILE_COURSE_TEXT = {
    '00': '初心者',
    ...Object.fromEntries(DAN_NAMES.map((name, i) => [String(i + 1).padStart(2, '0'), name])),
    ...Object.fromEntries(DAN_NAMES.map((name, i) => [String(i + 12), `真${name}`])),
    '22': '真皆伝',
    '23': '裏皆伝'
};
const getProfileCourseText = (courseRankText) => PROFILE_COURSE_TEXT[courseRankText];

// class的圖片編號(依序00~25)對應class名稱
const PROFILE_CLASS_TEXT = Object.fromEntries([
    'B5', 'B4', 'B3', 'B2', 'B1',
    'A5', 'A4', 'A3', 'A2', 'A1',
    'S5', 'S4', 'S3', 'S2', 'S1',
    'SS5', 'SS4', 'SS3', 'SS2', 'SS1',
    'SSS5', 'SSS4', 'SSS3', 'SSS2', 'SSS1',
    'LEGEND'
].map((name, i) => [String(i).padStart(2, '0'), name]));
const getProfileClassText = (classRankText) => PROFILE_CLASS_TEXT[classRankText];

// 段位認定的段位圖片編號對應段位名稱
const RECORD_COURSE_TEXT = {
    ...Object.fromEntries(DAN_NAMES.map((name, i) => [String(1001 + i), name])),
    ...Object.fromEntries(DAN_NAMES.map((name, i) => [String(1101 + i), `真${name}`])),
    '1121': '真皆伝',
    '1122': '裏皆伝'
};
const getRecordCourseText = (courseRankText) => RECORD_COURSE_TEXT[courseRankText];

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
    const [mode, ...args] = $('#now-title').text().trim().split('|');
    if (mode === 'plate') {
        const [plateName, type, versionName] = args;
        showPlateProgress(versionName, plateName === '覇' ? '覇者' : type, plateName === '覇' ? '' : plateName);
    } else if (mode === 'level') {
        showLevelListByRange();
    } else if (mode === 'suggestion') {
        const [displayLevel, versionTitle] = args;
        const isNewVersion = versionTitle === '不分新舊' ? null : versionTitle === '新曲';
        const gainChart = findMatchingSuggestion(displayLevel, isNewVersion);

        const $songGrid = createSuggestionSongCard(gainChart, isNewVersion);
        $('#song-table').find('.square-song-grid').replaceWith($songGrid);
    } else if (mode === 'rating') {
        initRatingList();
    } else if (mode === 'course') {
        showCourseProgress(args[0]);
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

// 歌曲是否達成該名牌條件
const isPlateCompleted = (song, plate) => {
    switch (plate) {
        case '極': return !!(song.fc || song.fcp || song.ap || song.app || song.fs || song.fsp || song.fdx || song.fdxp);
        case '将': return parseFloat(song.score) >= 100;
        case '神': return !!(song.ap || song.app);
        case '舞舞': return !!song.fdx;
        case '覇者': return parseFloat(song.score.replace('%', '')) >= 80;
        default: return false;
    }
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
    // 日版與國際版的版本欄位不同
    const versionField = $('#version-switch').is(':checked') ? 'versionJapan' : 'versionInternational';

    if (isNewVersion !== null) {
        const targetVersions = getTargetVersions();
        result = result.filter(x => targetVersions.includes(x[versionField]) === isNewVersion);
    }
    if (plate !== null) {
        result = result.filter(song => isPlateCompleted(song, plate));
    }
    if (minLevel !== null && maxLevel !== null) {
        result = result.filter(song => song.internalLevel >= minLevel && song.internalLevel <= maxLevel);
    }
    if (version !== null) {
        result = result.filter(x => x[versionField] === version);
    }

    const filters = { type, title, difficulty, internalLevel };
    for (const [key, value] of Object.entries(filters)) {
        if (value !== null) {
            result = result.filter(x => x[key] === value);
        }
    }

    return result;
};

// 逸出HTML屬性中的特殊字元
const escapeHtml = (text) => String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// 歌卡共用：難度class、定數文字、點擊跳轉(曲名放在data屬性，避免含單引號時破壞onclick)
const getDifficultyClass = (difficulty) => difficulty.replace(" ", "-").toLowerCase();
const formatSongLevel = (internalLevel) => internalLevel ? Number.parseFloat(internalLevel).toFixed(1) : '';
const songClickAttrs = (song) =>
    `onclick="showSongDetail(this.dataset.title, this.dataset.type)" data-title="${escapeHtml(song.title)}" data-type="${escapeHtml(song.type)}"`;

// 建立長形歌卡
function createSongCard(song) {
    const diffClass = getDifficultyClass(song.difficulty);
    const { title, image, internalLevel, type, score, rating } = song;

    if (rating === 0) {
        return '';
    }

    const deg = Math.floor(Math.random() * 5)

    return `
    <div class="song-card difficulty-${diffClass} deg${deg}" ${songClickAttrs(song)}>
        <img src="${image}" class="song-image" alt="${escapeHtml(title)}" />
        <div class="song-overlay"></div>
        <div class="song-info-block">
            <div class="rating-block-song-title song-content text-shadow-black">${title}</div>
            <div class="rating-block-inner-level song-content text-shadow-black">${formatSongLevel(internalLevel)} | ${type.toUpperCase()}</div>
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
        <div class="square-song-card difficulty-${getDifficultyClass(song.difficulty)} ${isCompleted === true ? 'completed' : ''} deg${Math.floor(Math.random() * 5)}" 
                ${songClickAttrs(song)}>
            <img src="${song.image}" class="square-song-image" alt="${escapeHtml(song.title)}">
            <div class="song-overlay"></div>
            <div class="square-song-info-block">
                <div class="song-content text-shadow-black square-song-title">${song.title}</div>
                <div class="song-content text-shadow-black square-song-inner-level">${formatSongLevel(song.internalLevel)} | ${song.type.toUpperCase()}</div>
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

// 小數部分(.0~.5為一組，.6~.9為另一組)，先四捨五入避免 12.6 - 12 = 0.5999... 的浮點誤差
const splitLevel = (level) => {
    const baseLevel = Math.floor(level);
    const decimal = Math.round((level - baseLevel) * 10) / 10;
    return { baseLevel, isPlus: decimal >= 0.6 };
};

// 等級分組名稱(12.0~12.5 => "12"，12.6~12.9 => "12+")
const getLevelGroupKey = (level) => {
    const { baseLevel, isPlus } = splitLevel(level);
    return isPlus ? `${baseLevel}+` : `${baseLevel}`;
};

// 計算等級範圍
const calculateLevelRange = (level) => {
    const { baseLevel, isPlus } = splitLevel(level);
    const minLevel = isPlus ? baseLevel + 0.6 : baseLevel;
    const maxLevel = isPlus ? baseLevel + 0.9 : baseLevel + 0.5;
    return { minLevel, maxLevel };
};

// 候選曲的新舊曲標題(isNewVersion: true/false/null)
const getVersionTitle = (isNewVersion) => {
    if (isNewVersion === true) return '新曲';
    if (isNewVersion === false) return '舊曲';
    return '不分新舊';
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
                        <img src="img/ayo_angy.webp" class="w-100"><br><br>
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

// 匯入使用者資料
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

// 格式化日期
const formatDate = (inputDate, format) => {
    if (!inputDate) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const h24 = inputDate.getHours();
    const h12 = h24 % 12 || 12;

    const parts = {
        yyyy: inputDate.getFullYear(),
        MM: pad(inputDate.getMonth() + 1),
        dd: pad(inputDate.getDate()),
        HH: pad(h24),
        hh: pad(h12),
        mm: pad(inputDate.getMinutes()),
        ss: pad(inputDate.getSeconds()),
        tt: h24 < 12 ? 'AM' : 'PM'
    };

    return format.replace(/yyyy|MM|dd|HH|hh|mm|ss|tt/g, (match) => parts[match]);
}
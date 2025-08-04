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
            <img src="https://maimaidx-eng.com/maimai-mobile/img/line_01.png" class="user_data_block_line">
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
                <img class="h_30 m_3 v_m" src="https://maimaidx-eng.com/maimai-mobile/img/icon_star.png"><span id="user-star"></span>
            </div>
            </div>
            <div class="clearfix"></div>
        </div>
        `);
    $('#user-trophy-block').attr('class', data.user_info.user_trophy_block + ' trophy_block p_3 t_c f_0');
    $('#user-trophy').text(data.user_info.trophy);
    $('#user-name').text(data.user_info.name);
    $('#user-rating').text(data.user_info.rating);
    $('#user-rating-base').attr('src', data.user_info.rating_base);
    $('#user-course-rank').attr('src', data.user_info.course_rank);
    $('#user-class-rank').attr('src', data.user_info.class_rank);
    $('#div-user-star-text span').text('☆' + data.user_info.star);
    $('#user-star').text(data.user_info.star);
    $('#user-icon').attr('src', data.user_info.icon);
    $('#user-info').removeClass('d-none');

    let course_rank_text = getCourseRank(data.user_info.course_rank_text);
    let class_rank_text = getClassRank(data.user_info.class_rank_text);
    $('#div-user-course-rank-text span').text(course_rank_text);
    $('#div-user-class-rank-text span').text(class_rank_text);
}

// 段位的圖片編號對應段位名稱
const getCourseRank = (course_rank_text) => {
    switch (course_rank_text) {
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
const getClassRank = (class_rank_text) => {
    switch (class_rank_text) {
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

// 顯示對應功能
const showTable = async (mode) => {
    $('#level-filter').hide();
    $('#stat').empty();
    $('#now-title').text('');

    const tableHandlers = {
        'rating': initRatingList,
        'plate': initPlateList,
        'level': initLevelList,
        'suggestion': initSuggestionList,
        'a_xuan': initForAXuanList,
        'a_yo': initForAyoList,
    };

    $('#completion-filters').toggleClass('d-none', !['plate', 'level'].includes(mode));
    $('#play-filters').toggleClass('d-none', !['suggestion', 'a_xuan'].includes(mode));

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

    if (isNewVersion !== null && $('#version-switch').is(':checked')) {
        result = result.filter(x => (x.versionJapan === currentVersion) === isNewVersion);
    } else if (isNewVersion !== null) {
        result = result.filter(x => (x.versionInternational === currentVersion) === isNewVersion);
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
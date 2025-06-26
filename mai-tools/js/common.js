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
  $('#user-star').text(data.user_info.star);
  $('#user-icon').attr('src', data.user_info.icon);
  $('#user-info').removeClass('d-none');
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
    handlePlayedFilters();
  });
}
const handlePlayedFilters = () => {
  const now = $('#now-title').text().trim();
  const mode = now.split('|')[0];
  if (mode === 'suggestion') {
    const displayLevel = now.split('|')[1];
    const isNewVersion = now.split('|')[2];
    const matchingSuggestion = findMatchingSuggestion(displayLevel, isNewVersion === 'true');
    if (matchingSuggestion) {
      const $songGrid = createSuggestionSongCard(matchingSuggestion);
      $('#song-table').find('.square-song-grid').replaceWith($songGrid);
    }
  } else if (mode === 'axuan') {
    const displayLevel = now.split('|')[1];
    const matchingSuggestion = findMatchingSuggestionXuan(displayLevel);
    console.log(matchingSuggestion);
    if (matchingSuggestion) {
      const $songGrid = createSuggestionSongCardXuan(matchingSuggestion);
      $('#song-table').find('.square-song-grid').replaceWith($songGrid);
    }
  }
}

// 是否已達成
const bindCompletionEventListeners = () => {
  $('#completed-only, #non-completed-only').on('change', function () {
    const $this = $(this);
    const $other = $this.attr('id') === 'completed-only' ? $('#non-completed-only') : $('#completed-only');

    if ($this.is(':checked')) {
      $other.prop('checked', false);
    }
    handleCompletionFilters();
  });
};
const handleCompletionFilters = () => {
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
  }
};

// 過濾歌曲
const songFilter = (songs, {
  isNewVersion = null,
  type = null,
  title = null,
  difficulty = null,
  versionInternational = null,
  versionJapan = null,
  internalLevel = null,
  minLevel = null,
  maxLevel = null,
  plate = null
} = {}) => {
  let result = songs;

  if (isNewVersion !== null) {
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

  const filters = {
    type,
    title,
    difficulty,
    versionInternational,
    versionJapan,
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
        <div class="square-song-card difficulty-${song.difficulty.replace(" ", "-").toLowerCase()} ${isCompleted === true ? 'completed' : ''}" 
                style="background-image: url('${song.image}');" 
                onclick="showSongDetail('${song.title}', '${song.type}')">
            <div class="song-overlay"></div>
            <div class="song-content text-shadow-black square-song-title">${song.title}</div>
            <div class="song-content text-shadow-black square-song-inner-level">${song.internalLevel ? Number.parseFloat(song.internalLevel).toFixed(1) : ''} | ${song.type.toUpperCase()}</div>
            <div class="song-content text-shadow-black square-song-score">${song.score}</div>
            ${isCompleted === true ? '<div class="completion-check"><b>✓</b></div>' : ''}
            ${isPlayed !== null ? `<div class="rating-gain-info text-shadow-black" >${song.targetRating ? `${song.targetRating}(${song.ratingGain})` : ''}</div>` : ''}
            <div class="card-decoration"></div>
        </div>`;

}

// 如果等級是整數，則添加小數點和零
const formatLevel = (level) => {
  const str = level.toString();
  return str.includes('.') ? str : `${str}.0`;
};
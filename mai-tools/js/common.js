const SCORE_THRESHOLDS = [
  { name: 'clear', score: 80.00 },
  { name: 'S', score: 97.00 },
  { name: 'S+', score: 98.00 },
  { name: 'SS', score: 99.00 },
  { name: 'SS+', score: 99.50 },
  { name: 'SSS', score: 100.00 },
  { name: 'SSS+', score: 100.50 }
];

const bindPlayedEventListeners = () => {
  $('#played-only, #non-played-only').on('change', function () {
    const $this = $(this);
    const $other = $this.attr('id') === 'played-only' ? $('#non-played-only') : $('#played-only');

    if ($this.is(':checked')) {
      $other.prop('checked', false);
    }
  });
  $('#played-only, #non-played-only').on('change', function () {
    const now = $('#now-title').text().trim();
    const mode = now.split('|')[0];
    if (mode === 'rating_suggestion') {
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
      if (matchingSuggestion) {
        const $songGrid = createSuggestionSongCard(matchingSuggestion);
        $('#song-table').find('.square-song-grid').replaceWith($songGrid);
      }
    }
  });
}

const handleCompletionFilters = () => {
  $('#completed-only, #non-completed-only').on('change', function () {
    const $this = $(this);
    const $other = $this.attr('id') === 'completed-only' ? $('#non-completed-only') : $('#completed-only');

    if ($this.is(':checked')) {
      $other.prop('checked', false);
    }

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
  });
};

const songFilter = (songs, {
  is_new_version = null,
  type = null,
  title = null,
  difficulty = null,
  version_international = null,
  version_japan = null,
  internalLevel = null,
  plate = null
} = {}) => {
  let result = songs;

  if (is_new_version !== null) {
    result = result.filter(x => (x.version_international === currentVersion) === is_new_version);
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
    }
    );
  }

  const filters = {
    type,
    title,
    difficulty,
    version_international,
    version_japan,
    internalLevel
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value !== null) {
      result = result.filter(x => x[key] === value);
    }
  }

  return result;
};

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
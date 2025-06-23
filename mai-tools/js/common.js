
const handleCompletionFilters = () => {
  $('#completed-only, #non-completed-only').off('change').on('change', function () {
    const $this = $(this);
    const $other = $this.attr('id') === 'completed-only' ? $('#non-completed-only') : $('#completed-only');

    if ($this.is(':checked')) {
      $other.prop('checked', false);
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

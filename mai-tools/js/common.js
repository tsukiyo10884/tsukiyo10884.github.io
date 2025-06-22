
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
  internalLevel = null
} = {}) => {
  let result = songs;

  if (is_new_version !== null) {
    result = result.filter(x => (x.version_international === currentVersion) === is_new_version);
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

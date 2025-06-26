const initForAXuanList = () => {
    gainListAll = songsCanGainRating(data.songs, getTop50Songs());
    groupedNewSongs = groupSongs(gainListAll, true);
    groupedOldSongs = groupSongs(gainListAll, false);
    const $songsSection = createButtonSection('all songs');

    $('#song-table').empty().append($songsSection);
    $('#stat').empty();
    $('#stat').removeClass('ayo');
    $('#stat').addClass('axuan');
    $('.basic_block').hide();
    $('#axuan_profile')?.remove();
    $('#ayo_profile')?.remove();
    const $profile = $('<img id="axuan_profile">')
        .attr('src', 'img/axuan_profile.png')
        .attr('style', 'position: relative;z-index:99;width: 422px;')
        .on('click', function () {
            $('.basic_block').show();
            $profile.remove();
        });
    $('#user-info').append($profile);
}

// 建立等級按鈕
const createLevelButtonXuan = (gainList, displayLevel) => {
    return $('<button>')
        .addClass('me-2 col-1 mb-2')
        .text(displayLevel)
        .on('click', () => showLevelDetailsXuan(gainList));
}

// 依等級顯示成就項目及歌卡
const showLevelDetailsXuan = (gainList) => {
    createAchivementButtonsSuggestion();
    bindRatingThresholdEventListeners();
    const $songGrid = createSuggestionSongCardXuan(gainList);

    const baseLevel = Math.floor(gainList.level);
    const decimal = gainList.level - baseLevel;
    const displayLevel = decimal < 0.6 ? baseLevel : `${baseLevel}+`;
    const $title = $(`<div>`).addClass('section-title text-shadow-black').text(`等級${displayLevel}候選曲(不分新舊)`);
    $('#now-title').text(`axuan|${displayLevel}`);
    $('#song-table').empty().append($title, $songGrid);

    if (selectedRatingThreshold) {
        handlePlayedFilters();
    }
}

// 建立建議歌卡
const createSuggestionSongCardXuan = (gainList) => {
    const { minLevel, maxLevel } = calculateLevelRange(gainList.level);

    let songs = songFilter(data.songs, { minLevel: minLevel, maxLevel: maxLevel });
    songs.sort((a, b) => b.internalLevel - a.internalLevel);
    const songCards = songs.map(song => {
        const currentRating = calculateSongRating(song);

        const selectedThreshold = $('input[name="rating-threshold"]:checked').val();
        const matchingSuggestion = gainListAll.find(s => s.level === song.internalLevel && (s.isNewVersion === (song.versionInternational === currentVersion)));

        if (!matchingSuggestion) {
            return null;
        }
        const matchingUpgrade = matchingSuggestion.upgrades.find(upg => upg.rank === selectedThreshold);
        if (!matchingUpgrade) {
            return null;
        }
        const targetRating = matchingUpgrade.rating;
        const gain = matchingUpgrade.gain;

        song.targetRating = targetRating;
        song.ratingGain = gain;

        if (gain === '+0' || currentRating >= targetRating) {
            return null;
        }
        return createSquareSongCard(song, { isPlayed: song.score !== '0.0000%' });
    }).filter(card => card !== null).join('');

    if (!songCards) {
        return $('<div>').addClass('square-song-grid col-12 row ms-0 text-center').html('<div class="col-12 py-5">無</div>');
    }

    return $('<div>').addClass('square-song-grid col-12 row ms-0').html(songCards);
}

// 查找符合條件的建議項目
const findMatchingSuggestionXuan = (displayLevel) => {
    return gainListAll.find(s => {
        const baseLevel = Math.floor(s.level);
        const decimal = s.level - baseLevel;
        const groupKey = decimal < 0.6 ? baseLevel.toString() : `${baseLevel}+`;
        return groupKey === displayLevel;
    });
}

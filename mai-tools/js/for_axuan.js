const initForAXuanList = () => {
    const $allSongsSection = createButtonSection('all songs');
    $('#song-table').empty().append($allSongsSection);

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

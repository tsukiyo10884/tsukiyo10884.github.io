let clickCount = 0;
let clearCount = 0;
$(document).ready(function () {
    $('.user-info').on('click', function () {
        clickCount++;

        if (clickCount === 3) {
            createSpecialButtons();
        }
    });
});

const createSpecialButtons = () => {
    const $col1 = $('<div class="special col-1 align-content-center">');
    const $col2 = $('<div class="special col-1 align-content-center">');
    const $col3 = $('<div class="special col-1 align-content-center">');

    const $button1 = $('<button>')
        .html('<img src="img/axuan_icon.png" alt="阿瑄專屬" style="height: 50px;">')
        .css({
            'padding': '0px'
        })
        .attr('data-bs-toggle', 'tooltip')
        .attr('data-bs-placement', 'bottom')
        .attr('title', '阿瑄專屬')
        .on('click', () => showTable('a_xuan'))


    const $button2 = $('<button>')
        .html('<img src="img/ayo_icon.png" alt="阿幽專屬" style="height: 50px;">')
        .css({
            'padding': '0px'
        })
        .attr('data-bs-toggle', 'tooltip')
        .attr('data-bs-placement', 'bottom')
        .attr('title', '阿幽專屬')
        .on('click', () => showTable('a_yo'));

    const $button3 = $('<button>')
        .text('清空')
        .addClass('f_12')
        .on('click', clear);

    $col1.append($button1);
    $col2.append($button2);
    $col3.append($button3);
    $('#info').append($col1, $col2, $col3);
}
const clear = () => {
    if (clearCount > 0) {
        $('#stat').removeClass('axuan');
        $('#stat').removeClass('ayo');
        $('.fly').remove();
        $('#axuan_profile').remove();
        $('#ayo_profile').remove();
        $('.special').remove();
        $('.basic_block').show();
        clearCount = 0;
        clickCount = 0;
    } else {
        $('.fly').remove();
        clearCount++;
    }
}

//阿幽
const initForAyoList = () => {
    $('#stat').removeClass('axuan');
    $('#stat').addClass('ayo');
    flys();
    $('.basic_block').hide();
    $('#axuan_profile')?.remove();
    $('#ayo_profile')?.remove();
    const $profile = $('<img id="ayo_profile">')
        .attr('src', 'img/ayo_profile.png')
        .attr('style', 'position: relative;z-index:99;width: 422px;')
        .on('click', function () {
            $('.basic_block').show();
            $profile.remove();
        });
    $('#user-info').append($profile);
}

const flys = () => {
    for (let i = 0; i < 3; i++) {
        let $img = $('<img class="fly">').attr('src', `img/ayo_mini.png`);
        $('#result-container').append($img);
    }

    $('.fly').each(function () {
        randomMove($(this));
    });

    $('#result-container').on('click touchstart', '.fly', function () {
        $(this).fadeOut(300, function () {
            $(this).remove();
        });
    });
}
const randomMove = ($el) => {
    let x = Math.random() * ($(window).width() - 100);
    let y = Math.random() * ($(window).height() - 100);
    let duration = 500 + Math.random() * 800;

    $el.animate({ left: x, top: y }, duration, 'swing', function () {
        randomMove($el);
    });
}

//阿瑄
const initForAXuanList = () => {
    gainChartList = rangeCanGainRating(data.songs, getTop50Songs());
    groupedNewSongs = groupSongs(true);
    groupedOldSongs = groupSongs(false);
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

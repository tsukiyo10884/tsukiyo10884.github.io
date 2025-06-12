function aYo() {
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

function flys() {
    for(let i = 0; i < 3; i++) {
        let $img = $('<img class="fly">').attr('src', `img/ayo_mini.png`);
        $('body').append($img);
    }

    $('.fly').each(function () {
        randomMove($(this));
    });

    $('body').on('click touchstart', '.fly', function () {
        $(this).fadeOut(300, function () {
            $(this).remove();
        });
    });
}
function randomMove($el) {
    let x = Math.random() * ($(window).width() - 100);
    let y = Math.random() * ($(window).height() - 100);
    let duration = 500 + Math.random() * 800;

    $el.animate({ left: x, top: y }, duration, 'swing', function () {
        randomMove($el);
    });
}

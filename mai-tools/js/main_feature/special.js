let clickCount = 0;
$(document).ready(function () {
    $('.user-info').on('click', function () {
        clickCount++;

        if (clickCount === 3) {
            createSpecialButtons();
        }
    });
});

// 建立專屬頁面的圖示按鈕
const createSpecialIconButton = (iconName, title, mode) => {
    return $('<button>')
        .html(`<img src="./img/special/${iconName}_icon.webp" alt="${title}" style="height: 50px;">`)
        .css({ padding: '0px' })
        .attr('data-bs-toggle', 'tooltip')
        .attr('data-bs-placement', 'bottom')
        .attr('title', title)
        .on('click', () => showTable(mode));
}

const createSpecialButtons = () => {
    const $clearButton = $('<button>')
        .text('清空')
        .addClass('f_12')
        .on('click', clear);

    const $buttons = [
        createSpecialIconButton('axuan', '阿瑄專屬', 'a_xuan'),
        createSpecialIconButton('ayo', '阿幽專屬', 'a_yo'),
        $clearButton
    ];
    const $cols = $buttons.map($button =>
        $('<div class="special col-1 align-content-center">').append($button)
    );
    $('#info').append($cols);
}
// 清空：場上還有蒼蠅時只清蒼蠅，沒有蒼蠅了才清掉專屬頁面與按鈕
const clear = () => {
    if ($('.fly').length > 0) {
        $('.fly').remove();
        return;
    }

    $('#stat').removeClass('axuan ayo');
    $('#axuan_profile, #ayo_profile').remove();
    $('.special').remove();
    $('.basic_block').show();
    clickCount = 0;
}

// 顯示專屬頁面的大頭貼(name: 'ayo' | 'axuan')
const showSpecialProfile = (name) => {
    const other = name === 'ayo' ? 'axuan' : 'ayo';
    $('#stat').removeClass(other).addClass(name);
    $('.basic_block').hide();
    $('#axuan_profile, #ayo_profile').remove();
    const $profile = $(`<img id="${name}_profile">`)
        .attr('src', `./img/special/${name}_profile.webp`)
        .attr('style', 'position: relative;z-index:99;width: 422px;')
        .on('click', function () {
            $('.basic_block').show();
            $profile.remove();
        });
    $('#user-info').append($profile);
}

//阿幽
const initForAyoList = () => {
    flys();
    showSpecialProfile('ayo');
}

const flys = () => {
    // 每次點擊都新增3隻，只讓新增的開始移動(舊的已經在動了)
    for (let i = 0; i < 3; i++) {
        let $img = $('<img class="fly">').attr('src', `./img/special/ayo_mini.webp`);
        $('#result-container').append($img);
        randomMove($img);
    }

    // 重複進入時避免累積多個事件
    $('#result-container').off('click.fly touchstart.fly').on('click.fly touchstart.fly', '.fly', function () {
        // 先停掉飛行動畫，否則淡出會排在飛行動畫後面而延遲
        $(this).stop(true).fadeOut(300, function () {
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
    refreshSuggestionData();
    const $allSongsSection = createButtonSection('all songs');
    $('#song-table').empty().append($allSongsSection);

    showSpecialProfile('axuan');
}

const showCollection = (data) => {
    console.log(data);
    $('#icon').attr('src', data.icon);
    $('#user-name').text(data.name);
    $('#rating').text(data.rating);
    $('#rating-base').attr('src', data.ratingBase);
    $('#course').attr('src', data.courseRank);
    $('#class').attr('src', data.classRank);
    $('#user-trophy').text(data.trophy);
    $('#user-trophy-block').attr('class', data.trophyBlock + ' trophy_block p_3 t_c f_0');
    $('#nameplate').attr('src', data.nameplate);
    $('#frame').attr('src', data.frame);
    $('#leader').attr('src', data.characters[0]);
    $('#member2').attr('src', data.characters[1]);
    $('#member3').attr('src', data.characters[2]);
    $('#member4').attr('src', data.characters[3]);
    $('#member5').attr('src', data.characters[4]);

    $('#leader-level').text(data.charactersLevel[0].lv);
    $('#member2-level').text(data.charactersLevel[1].lv);
    $('#member3-level').text(data.charactersLevel[2].lv);
    $('#member4-level').text(data.charactersLevel[3].lv);
    $('#member5-level').text(data.charactersLevel[4].lv);

    $('#leader-reborn').toggle(data.charactersLevel[0].reborn > 0);
    $('#member2-reborn').toggle(data.charactersLevel[1].reborn > 0);
    $('#member3-reborn').toggle(data.charactersLevel[2].reborn > 0);
    $('#member4-reborn').toggle(data.charactersLevel[3].reborn > 0);
    $('#member5-reborn').toggle(data.charactersLevel[4].reborn > 0);
    
    if (data.charactersLevel[0].reborn > 0) {
        $('#leader-bar').attr('src', '/mai-tools/img/member_rainbow_bar.png');
    } else if (data.charactersLevel[0].lv >= 1 && data.charactersLevel[0].lv <= 8) {
        $('#leader-bar').attr('src', '/mai-tools/img/member_blue_bar.png');
    } else if (data.charactersLevel[0].lv >= 9 && data.charactersLevel[0].lv <= 48) {
        $('#leader-bar').attr('src', '/mai-tools/img/member_green_bar.png');
    } else if (data.charactersLevel[0].lv >= 49 && data.charactersLevel[0].lv <= 98) {
        $('#leader-bar').attr('src', '/mai-tools/img/member_red_bar.png');
    } else if (data.charactersLevel[0].lv >= 99 && data.charactersLevel[0].lv <= 298) {
        $('#leader-bar').attr('src', '/mai-tools/img/member_bronze_bar.png');
    } else if (data.charactersLevel[0].lv >= 299 && data.charactersLevel[0].lv <= 998) {
        $('#leader-bar').attr('src', '/mai-tools/img/member_silver_bar.png');
    } else if (data.charactersLevel[0].lv >= 999 && data.charactersLevel[0].lv <= 9998) {
        $('#leader-bar').attr('src', '/mai-tools/img/member_gold_bar.png');
    }

    const dict = {
        1: 'member2',
        2: 'member3',
        3: 'member4',
        4: 'member5'
    };
    for (let i = 1; i < data.charactersLevel.length; i++) {
        if (data.charactersLevel[i].reborn > 0) {
            $('#' + dict[i] + '-bg').attr('src', '/mai-tools/img/member_rainbow_bg.png');
            $('#' + dict[i] + '-layout').attr('src', '/mai-tools/img/member_rainbow_layout.png');
        } else if (data.charactersLevel[i].lv >= 1 && data.charactersLevel[i].lv <= 8) {
            $('#' + dict[i] + '-bg').attr('src', '/mai-tools/img/member_blue_bg.png');
            $('#' + dict[i] + '-layout').attr('src', '/mai-tools/img/member_blue_layout.png');
        } else if (data.charactersLevel[i].lv >= 9 && data.charactersLevel[i].lv <= 48) {
            $('#' + dict[i] + '-bg').attr('src', '/mai-tools/img/member_green_bg.png');
            $('#' + dict[i] + '-layout').attr('src', '/mai-tools/img/member_green_layout.png');
        } else if (data.charactersLevel[i].lv >= 49 && data.charactersLevel[i].lv <= 98) {
            $('#' + dict[i] + '-bg').attr('src', '/mai-tools/img/member_red_bg.png');
            $('#' + dict[i] + '-layout').attr('src', '/mai-tools/img/member_red_layout.png');
        } else if (data.charactersLevel[i].lv >= 99 && data.charactersLevel[i].lv <= 298) {
            $('#' + dict[i] + '-bg').attr('src', '/mai-tools/img/member_bronze_bg.png');
            $('#' + dict[i] + '-layout').attr('src', '/mai-tools/img/member_bronze_layout.png');
        } else if (data.charactersLevel[i].lv >= 299 && data.charactersLevel[i].lv <= 998) {
            $('#' + dict[i] + '-bg').attr('src', '/mai-tools/img/member_silver_bg.png');
            $('#' + dict[i] + '-layout').attr('src', '/mai-tools/img/member_silver_layout.png');
        } else if (data.charactersLevel[i].lv >= 999 && data.charactersLevel[i].lv <= 9998) {
            $('#' + dict[i] + '-bg').attr('src', '/mai-tools/img/member_gold_bg.png');
            $('#' + dict[i] + '-layout').attr('src', '/mai-tools/img/member_gold_layout.png');
        }
    }


}

const toggleDisplay = (id) => {
    if ($('#btn-' + id).prop('checked')) {
        $('#div-' + id).removeClass('d-none');
    } else {
        $('#div-' + id).addClass('d-none');
    }
}
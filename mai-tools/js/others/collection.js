// 等級對應的樣式名稱(依序判斷，覺醒過的一律rainbow)
const MEMBER_LEVEL_STYLES = [
    { max: 8, name: 'blue' },
    { max: 48, name: 'green' },
    { max: 98, name: 'red' },
    { max: 298, name: 'bronze' },
    { max: 998, name: 'silver' },
    { max: 9998, name: 'gold' }
];
const getMemberStyle = ({ lv, reborn }) => {
    if (reborn > 0) return 'rainbow';
    if (lv < 1) return undefined;
    return MEMBER_LEVEL_STYLES.find(style => lv <= style.max)?.name;
};

const showCollection = (data) => {
    console.log(data);
    $('#icon').attr('src', data.icon);
    $('#user-name').text(data.name);
    $('#rating').text(data.rating);
    $('#rating-base').attr('src', data.ratingBase);
    $('#course').attr('src', data.courseRank);
    $('#class').attr('src', data.classRank);
    applyDispRate(data.dispRate);
    $('#user-trophy').text(data.trophy);
    $('#user-trophy-block').attr('class', data.trophyBlock + ' trophy_block p_3 t_c f_0');
    $('#nameplate').attr('src', data.nameplate);
    $('#frame').attr('src', data.frame);
    $('#circle-name').text(data.circleName);
    $('#circle-bg').attr('src', data.circleImg);

    // 隊長與旅伴：圖片、等級、覺醒標記
    const MEMBER_IDS = ['leader', 'member2', 'member3', 'member4', 'member5'];
    MEMBER_IDS.forEach((id, i) => {
        const { lv, reborn } = data.charactersLevel[i];
        $('#' + id).attr('src', data.characters[i]);
        $(`#${id}-level`).text(lv);
        $(`#${id}-reborn`).toggle(reborn > 0);
    });

    // 依等級(覺醒為rainbow)決定隊長的底條與旅伴的底圖、版型
    const leaderStyle = getMemberStyle(data.charactersLevel[0]);
    if (leaderStyle) {
        $('#leader-bar').attr('src', `/mai-tools/img/collection/member_${leaderStyle}_bar.webp`);
    }
    for (let i = 1; i < data.charactersLevel.length; i++) {
        const memberStyle = getMemberStyle(data.charactersLevel[i]);
        if (memberStyle) {
            $(`#${MEMBER_IDS[i]}-bg`).attr('src', `/mai-tools/img/collection/member_${memberStyle}_bg.webp`);
            $(`#${MEMBER_IDS[i]}-layout`).attr('src', `/mai-tools/img/collection/member_${memberStyle}_layout.webp`);
        }
    }
}

// maimai-net 的 dispRate 選項 -> 要顯示的項目 (rating=R值, course=段位, class=Class)
const DISP_RATE_MAP = {
    0: ['rating', 'course', 'class'],
    1: ['rating', 'course'],
    2: ['rating', 'class'],
    3: ['course', 'class'],
    4: ['rating'],
    5: ['course'],
    6: ['class'],
    7: []
};

const applyDispRate = (dispRate) => {
    const visible = DISP_RATE_MAP[dispRate];
    if (!visible) return;
    ['rating', 'course', 'class'].forEach((id) => {
        $('#btn-' + id).prop('checked', visible.includes(id));
        toggleDisplay(id);
    });
}

const toggleDisplay = (id) => {
    if ($('#btn-' + id).prop('checked')) {
        $('#div-' + id).removeClass('d-none');
    } else {
        $('#div-' + id).addClass('d-none');
    }
}
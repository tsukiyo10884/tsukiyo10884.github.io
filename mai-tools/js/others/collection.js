const showCollection = (data) => {
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
}
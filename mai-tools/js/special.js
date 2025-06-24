let clickCount = 0;
$(document).ready(function () {
    $('.user-info').on('click', function () {
        clickCount++;

        if (clickCount === 3) {
            createSpecialButtons();
        }
    });
});

const createSpecialButtons = () => {
    const $col1 = $('<div class="special">').addClass('col-1');
    const $col2 = $('<div class="special">').addClass('col-1');
    const $col3 = $('<div class="special">').addClass('col-1');

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

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
}
const clear = () => {
    $('#stat').removeClass('axuan');
    $('#stat').removeClass('ayo');
    $('.fly').remove();
    $('#axuan_profile').remove();
    $('#ayo_profile').remove();
    $('.special').remove();
    $('.basic_block').show();
    clickCount = 0;
}
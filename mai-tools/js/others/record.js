
const showRatingChart = async (id=null) => {
    const filteredData = (await fbTools.getUserHistory("5008034116853")).reverse();
    const labels = filteredData.map(e => e.record_date.toLocaleString());
    const ratings = filteredData.map(e => e.rating);
    const pointColors = ratings.map((_, i) => i === 0 ? 'white' : '#0b4670');
    const ctx = document.getElementById('rating-chart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rating',
                data: ratings,
                borderColor: '#0b4670',
                backgroundColor: '#0b4670',
                fill: false,
                tension: 0,
                borderWidth: 1,
                pointRadius: 3,
                pointBackgroundColor: pointColors,
                pointBorderColor: '#0b4670',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            layout: {
                padding: {
                    right: 60,
                    top: 40,
                    bottom: 40,
                }
            },
            scales: {
                x: {
                    ticks: { display: false },
                    grid: { display: false },
                    reverse: true,
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: (value) => value.toLocaleString(),
                        color: '#203844',
                        font: {
                            size: 12
                        },
                        padding: 15,
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        return value.toLocaleString();
                    },
                    color: (ctx) => ctx.dataIndex === 0 ? 'red' : '#0b4670',
                    align: (ctx) => ctx.dataIndex === 0 ? 'right' : 'bottom',
                    offset: 2,
                    font: {
                        size: 12
                    },
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: ratings[0],
                            yMax: ratings[0],
                            borderColor: 'red',
                            borderWidth: 1,
                            drawTime: 'beforeDatasetsDraw'
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    Chart.defaults.color = '#203844';
    ctx.canvas.style.backgroundColor = '#ffffff';
}

// 歌曲詳細資料
const showSongRecord = () => {
    const $container = $("#song-list");
    $container.empty();
    $("#song-table").empty();

    // 篩選條件
    let filteredData = recordData;
    const selectedDates = $('input[name="date-filter"]:checked').map(function () {
        return this.value;
    }).get();
    if (selectedDates.length > 0) {
        filteredData = filteredData.filter(song => selectedDates.includes(song.date.substring(0, 10)));
    } else {
        filteredData = [];
    }
    if ($('#btn-new-record').is(':checked')) {
        filteredData = filteredData.filter(song => song.score_new_record);
    }
    if ($('#btn-new-dx-record').is(':checked')) {
        filteredData = filteredData.filter(song => song.dx_score_new_record);
    }
    if ($('#btn-highest-score').is(':checked')) {
        const highestScores = new Map();
        filteredData.forEach(song => {
            const key = `${song.title}_${song.type}_${song.difficulty}`;
            const currentScore = parseFloat(song.score.replace('%', ''));
            const existingEntry = highestScores.get(key);
            if (!existingEntry || currentScore > parseFloat(existingEntry.score.replace('%', ''))) {
                highestScores.set(key, song);
            }
        });
        filteredData = Array.from(highestScores.values());
    }

    // 顯示歌曲紀錄清單
    $('#song-table').append(`
        <thead>
            <tr>
                <th>封面</th>
                <th>定數</th>
                <th class="text-start">曲名</th>
                <th>成績</th>
                <th>DX成績</th>
                <th>遊玩時間</th>
                <th>詳細</th>
            </tr>
        </thead>`);
    filteredData.forEach((song, index) => {
        $("#song-table").append(`
            <tr class="tr-${song.difficulty} toggle-row text-white" data-id="${index}" onclick="toggleRecordDetails(${index})">
                <td><img src="${song.image}" width="30"></td>
                <td><span class="text-drop-shadow">${song.internalLevel.toString().includes('?') ? song.internalLevel : Number.parseFloat(song.internalLevel).toFixed(1)}</span></td>
                <td class="text-start"><span class="text-drop-shadow"><span class="song-tag">${(song.difficulty == "utage" ? song.title.substring(0, 3) : "[" + song.type.toUpperCase() + "]")}</span> ${song.difficulty == "utage" ? song.title.substring(3, song.title.length) : song.title}</span></td>
                <td class="text-end"><span class="text-drop-shadow">${song.score_new_record ? ' <span class="new-record">NEW!</span>' : ''}${song.score}</span></td>
                <td class="text-end"><span class="text-drop-shadow">${song.dx_score_new_record ? '<span class="new-record">NEW!</span>' : ''}${song.dx_score}</span></td>
                <td><span class="text-drop-shadow">${song.date}</span></td>
                <td style="cursor: pointer;"><span id="toggle-status-${index}" class="text-drop-shadow">＋</span></td>
            </tr>
            <tr class="detail-row" id="detail-${index}" style="display:none;">
                <td colspan="7" style="background:#f9f9f9;width: 100%">
                    ${renderRecordDetails(song)}
                </td>
            </tr>
        `);
    });
}

//toggle detail
const toggleRecordDetails = (id) => {
    const $detailRow = $(`#detail-${id}`);
    $detailRow.toggle();
    const $toggleStatus = $(`#toggle-status-${id}`);
    $toggleStatus.text($detailRow.is(":visible") ? "－" : "＋");
};

//顯示詳細記錄
const renderRecordDetails = (song) => {
    return `
        <div class="row f_12 px-2">
            <div class="col-md-3 pt-2">
                <p class="fw-bold text-start text-danger mb-1">${song.track}</p>
                <img src="${song.image}" alt="${song.title}" width="120">
                <div>
                    <div><strong>${song.difficulty == "utage" ? song.title.substring(3, song.title.length) : song.title}</strong></div>
                    <div>${song.internalLevel.toString().includes('?') ? song.internalLevel : Number.parseFloat(song.internalLevel).toFixed(1)} | ${song.difficulty == "utage" ? song.title.substring(1, 2) : song.type.toUpperCase()}</div>
                </div>
            </div>

            <div class="col-md-5 p-0">
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>類型</th>
                            <th>Critical Perfect</th>
                            <th>Perfect</th>
                            <th>Great</th>
                            <th>Good</th>
                            <th>Miss</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(song.notes).map(([type, stats]) => `
                        <tr>
                            <td>${type}</td>
                            <td class="cp">${stats.critical_perfect}</td>
                            <td class="p">${stats.perfect}</td>
                            <td class="g">${stats.great}</td>
                            <td class="good">${stats.good}</td>
                            <td class="m">${stats.miss}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="col px-4 pt-3">
                <div>
                    <span class="fast">FAST: ${song.fast}</span> |
                    <span class="late">LATE: ${song.late}</span>
                </div>
                <div>Rating: ${song.rating} ${song.rating_plus}</div>
                <div>Max Combo: ${song.max_combo}</div>
                <div>Max Sync: ${song.max_sync.replace('―', '-')}</div>
                <div class="dx-score mt-3">DX SCORE: ${song.dx_score}</div>
                ${song.star ? `<div class="d-flex justify-content-end w-100"><img src="${song.star}" alt="Star" height="15"></div>` : ''}
                <div class="d-flex justify-content-center w-100 mt-1">
                    <img src="${song.achive_1}" alt="Achieve 1" height="40">
                    <img src="${song.achive_2}" alt="Achieve 2" height="40">
                </div>
            </div>
        </div>
    `;
};

// 展開全部詳細資料
const uncollapseAllDetails = () => {
    $(".detail-row").show();
    $("span[id^='toggle-status-']").text("－");
}

// 收合全部詳細資料
const collapseAllDetails = () => {
    $(".detail-row").hide();
    $("span[id^='toggle-status-']").text("＋");
};

// 建立日期按鈕
const createDateButtons = (dates) => {
    const $dateButtonGroup = $('#date-button-group');
    $dateButtonGroup.empty();
    $dateButtonGroup.append('<span class="me-2 align-self-center">遊玩日期：</span>');
    dates.forEach(date => {
        const $button = $(`
            <input type="checkbox" name="date-filter" value="${date}" class="ms-2" onclick="showSongRecord()" checked>
            <label for="${date}">${date}</label>`);
        $dateButtonGroup.append($button);
    });
};

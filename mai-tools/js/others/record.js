
const showRatingChart = (recordData) => {
    const filteredData = recordData.filter((item, index, arr) => index === recordData.length - 1 || (arr[index + 1] != null && item.rating !== arr[index + 1].rating));
    const labels = filteredData.map((song, i) => `${song.no}.${song.difficulty} : ${song.title} ${song.rating_plus}`);
    const ratings = filteredData.map(song => parseInt(song.rating, 10));
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
                        stepSize: 500,
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
const showSongRecord = (recordData) => {
    const $container = $("#song-list");

    $.each(recordData, function (_, song) {
        let notesTable = `
            <table class="mb-2">
                <thead class="table-light">
                    <tr>
                        <th>Type</th>
                        <th>Critical Perfect</th>
                        <th>Perfect</th>
                        <th>Great</th>
                        <th>Good</th>
                        <th>Miss</th>
                    </tr>
                </thead>
                <tbody>
            `;

        $.each(song.notes, function (type, vals) {
            notesTable += `
                <tr>
                    <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
                    <td>${vals.critical_perfect}</td>
                    <td>${vals.perfect}</td>
                    <td>${vals.great}</td>
                    <td>${vals.good}</td>
                    <td>${vals.miss}</td>
                </tr>
            `;
        });

        notesTable += `</tbody></table>`;

        $container.append(`
            <div class="col-2">
                <div>
                <img src="${song.image}" class="card-img-top" alt="${song.title}">
                <div>
                    <h5>${song.title}</h5>
                    <p><strong>Score:</strong> ${song.score}</p>
                    <p><strong>DX Score:</strong> ${song.dx_score}</p>
                    <p><strong>FAST:</strong> ${song.fast} | <strong>LATE:</strong> ${song.late}</p>
                    <p><strong>Rating:</strong> ${song.rating} ${song.rating_plus}</p>
                    ${notesTable}
                    <p><strong>Max Combo:</strong> ${song.max_combo}</p>
                    <p><strong>Max Sync:</strong> ${song.max_sync}</p>
                </div>
                </div>
            </div>
        `);
    });

    // 顯示歌曲紀錄清單
    recordData.forEach((song, index) => {
        $("#song-table").append(`
            <tr class="tr-${song.difficulty}">
                <td><img src="${song.image}" width="30"></td>
                <td>${song.internalLevel}</td>
                <td class="text-start">${song.title}</td>
                <td>${song.score}</td>
                <td>${song.dx_score}</td>
                <td>${song.date}</td>
                <td><a class="toggle-detail" data-id="${index}">＋</a></td>
            </tr>
            <tr class="detail-row" id="detail-${index}" style="display:none;">
                <td colspan="7" style="background:#f9f9f9;width: 100%">
                    ${renderRecordDetails(song)}
                </td>
            </tr>
        `);
    });

    $(document).on("click", ".toggle-detail", function () {
        const id = $(this).data("id");
        $(`#detail-${id}`).toggle();
        if ($(`#detail-${id}`).is(":visible")) {
            $(this).text("－");
        } else {
            $(this).text("＋");
        }
    });
}

//顯示詳細記錄
const renderRecordDetails = (song) => {
    return `
        <div class="row align-items-center">
            <div class="col-md-7">
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

            <div class="col-md-5 p-4">
                <p>
                    <span class="fast">FAST: ${song.fast}</span> |
                    <span class="late">LATE: ${song.late}</span>
                </p>
                <p>Rating: ${song.rating} ${song.rating_plus}</p>
                <p>Max Combo: ${song.max_combo}</p>
                <p>Max Sync: ${song.max_sync.replace('―', '-')}</p>
            </div>
        </div>
    `;
};
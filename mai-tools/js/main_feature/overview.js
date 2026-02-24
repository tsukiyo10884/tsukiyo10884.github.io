const initOverview = async () => {
    const chartContent =
        `<div id="div-rating-chart" class="mb-4">
            <div id="rating-chart-title" class="text-center mb-3">
                <h5>Rating變化(近50筆)</h5>
            </div>
            <div class="heavy-hr"></div>
            <canvas id="rating-chart" height="100" class="my-4"></canvas>
            <div class="heavy-hr"></div>
        </div>`
    $('#song-table').html(chartContent);
    $('#now-title').text('overview');
    await showRatingChart();
}

const showRatingChart = async () => {
    if (generalData.ratingRecord === undefined) {
        $('#div-rating-chart').html('<p class="text-center my-4 text-white">資料仍在讀取中，請稍後...</p>');
        return;
    } else if (generalData.ratingRecord.length === 0) {
        $('#div-rating-chart').html('<p class="text-center my-4 text-white">無R值紀錄</p>');
        return;
    }
    const filteredData = generalData.ratingRecord.toReversed();
    const ratings = filteredData.map(e => e.rating);
    const pointColors = ratings.map((_, i) => i === 0 ? 'white' : '#0b4670');
    const ctx = document.getElementById('rating-chart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: filteredData.map(e => formatDate(new Date(e.record_date), 'yyyy/MM/dd')),
            datasets: [{
                label: 'Rating',
                data: filteredData
                , parsing: {
                    xAxisKey: 'record_date',
                    yAxisKey: 'rating'
                },
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
                    type: 'category',
                    grid: { display: false },
                    reverse: true,
                    ticks: { maxTicksLimit: 10 }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#203844',
                        font: {
                            size: 12
                        },
                        padding: 15,
                        maxTicksLimit: 10
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: (ctx) => ctx.dataIndex === 0 ? 'red' : '#0b4670',
                    align: (ctx) => ctx.dataIndex === 0 ? 'right' : 'bottom',
                    offset: 2,
                    font: {
                        size: 12
                    },
                    formatter: function (value, context) {
                        const index = context.dataIndex;
                        const total = context.dataset.data.length;
                        const ratingValue = value.rating;

                        if (total <= 10) return ratingValue;

                        if (total > 50) return index % 5 === 0 ? ratingValue : null;
                        if (total > 40) return index % 4 === 0 ? ratingValue : null;
                        if (total > 30) return index % 3 === 0 ? ratingValue : null;
                        if (total > 20) return index % 2 === 0 ? ratingValue : null;

                        return ratingValue;
                    }
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
                },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        title: function () {
                            return '';
                        },
                        label: function (context) {
                            const raw = context.raw;
                            return [
                                `Rating: ${raw.rating}`,
                                `Time: ${formatDate(new Date(raw.record_date), 'yyyy/MM/dd HH:mm')}`,
                            ];
                        }
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    Chart.defaults.color = '#203844';
    ctx.canvas.style.backgroundColor = '#ffffff';
};

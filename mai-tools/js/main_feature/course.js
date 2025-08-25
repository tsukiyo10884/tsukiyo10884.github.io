const initCourseList = () => {
    const courseProgress = '' // 之後去抓資料回來
    $('#stat').html(`
        <div class="d-flex align-items-center">
            <p>※施工中</p>
            <p>　　目前最高段位: ${courseProgress}</p>
        </div>
    `);
    let courseFilePath = '';
    if ($('#version-switch').is(':checked')) {
        courseFilePath = 'json/course_prism_plus_jp.json';
    } else {
        courseFilePath = 'json/course_prism_plus_intl.json';
    }
    $.getJSON(courseFilePath, (data) => {
        courseData = data;
    });

    setTimeout(() => {
        let buttons = `<div class="row">`
        courseData.forEach(courseType => {
            const button = `<div class="col-3"><button class="w-100 course-button" onclick="showCourseProgress('${courseType.type}')">${courseType.type}</button></div>`;
            buttons += button;
        });
        buttons += `</div>`;
        $('#song-table').html(buttons);
    }, 100);
}

const showCourseProgress = async (type) => {
    let courseContent = '';
    courseData.find(x => x.type === type).course.forEach(course => {
        courseContent += `
            <div class="course-block mb-5 p_0">
                <div class="course-info text-center mb-3">
                    <div class="col-12 d-flex align-items-center my-3">
                        <div class="section-divider left"></div>
                            <b class="px-3 section-divider-title f-20">${course.courseName}</b>
                        <div class="section-divider right"></div>
                    </div>
                    <p class="mb-4">Life ${course.totalLives} | great -${course.lifeLossPerJudgement.great} / good -${course.lifeLossPerJudgement.good} / miss -${course.lifeLossPerJudgement.miss} | pass + ${course.lifeRecoveryPerSong}</p>
                </div>
                <div id="course-song-card" class="row justify-content-center gap-3">
                    ${course.songs.map(song => {
                        const songData = data.songs.find(s => s.title === song.title && s.type === song.type && s.difficulty === song.difficulty);
                        return createSongCard(songData);
                    }).join('')}
                </div>
            </div>`;
    });
    $('#song-table').html(courseContent);

}
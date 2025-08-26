const initCourseList = async () => {
    const maxCourse = Math.max(
        ...data.course.flatMap(c => c.courseRecord.map(d => parseInt(d.courseName, 10)))
    ).toString().padStart(2, "0");;
    $('#stat').html(`
        <div class="d-flex align-items-center">
            <p>※施工中</p>
            <p>　　目前最高段位: ${getCourseRank(maxCourse)}</p>
        </div>
    `);
    let courseFilePath = $('#version-switch').is(':checked')
        ? 'json/course_prism_plus_jp.json'
        : 'json/course_prism_plus_intl.json';
    courseData = await getJSON(courseFilePath);

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
    let courseFilePath = $('#version-switch').is(':checked')
        ? 'json/course_prism_plus_jp.json'
        : 'json/course_prism_plus_intl.json';
    courseData = await getJSON(courseFilePath);
    $('#now-title').text(`course|${type}`);
    let courseContent = '';
    courseData.find(x => x.type === type).course.forEach(course => {
        const playedCourse = data.course.find(c => c.type === type);
        let currentCourse = null;
        if (playedCourse != null) {
            currentCourse = playedCourse.courseRecord.find(c => getCourseRank(c.courseName) === course.courseName);
        }
        courseContent += `
            <div class="course-block mb-5 p_0">
                <div class="course-info text-center mb-3">
                    <div class="col-12 d-flex align-items-center my-3">
                        <div class="section-divider left"></div>
                            <b class="px-3 section-divider-title f-20">${course.courseName}</b>
                        <div class="section-divider right"></div>
                    </div>
                    ${currentCourse != null ? `
                        <p class="mb-2">${currentCourse.isClear ? '合格' : '不合格'}</p>
                        <p class="mb-2">剩餘命數：${currentCourse.remainLife}、總成績：${currentCourse.totalScore}</p>
                    ` : ''}
                    <p class="mb-4">Life ${course.totalLives} | great -${course.lifeLossPerJudgement.great} / good -${course.lifeLossPerJudgement.good} / miss -${course.lifeLossPerJudgement.miss} | pass + ${course.lifeRecoveryPerSong}</p>
                </div>
                <div id="course-song-card" class="row justify-content-center gap-3">
                    ${course.songs.map((song, index) => {
            const songData = data.songs.find(s => s.title === song.title && s.type === song.type && s.difficulty === song.difficulty);
            let lastPlayedData = null;
            if (currentCourse != null && currentCourse.songs.length >= index) {
                lastPlayedData = currentCourse.songs[index];
            }
            return `
                            <div style="width:fit-content">
                                ${createSongCard(songData)}
                                ${lastPlayedData != null ? `<p class="mt-2 mb-0">上次成績：${lastPlayedData.score}</p>
                                <p class="mb-0">上次命數：${lastPlayedData.life}</p>` : ''}
                            </div>`;
        }).join('')}
                </div>
            </div>`;
    });
    $('#song-table').html(courseContent);

}
const getCourseFilePath = () => {
    const formattedVersion = currentVersion.toLowerCase().replace(/ /g, '_').replace(/~/g, '').replace(/__+/g, '_');
    const suffix = $('#version-switch').is(':checked') ? '_jp.json' : '_intl.json';
    return `json/course/course_${formattedVersion}${suffix}`;
};

const initCourseList = async () => {
    const maxCourse = Math.max(
        ...data.course.flatMap(c =>
            c.courseRecord
                .filter(d => d.isClear === true)
                .map(d => parseInt(d.courseName, 10))
        )
    ).toString().padStart(4, "0");

    $('#stat').html(`
        <div id="course-info" class="d-flex align-items-center">
            <div>
                <p>目前最高合格段位: ${getRecordCourseText(maxCourse)===undefined ? '尚無挑戰紀錄' : getRecordCourseText(maxCourse)}</p>
                <p class="f_12">※十段合格後才能挑戰真段位認定<br/>　真皆伝合格後才能挑戰裏皆伝<br/>　(雙人遊玩時，一方可挑戰另一方就也可跳級挑戰)</p>
            </div>
        </div>
    `);

    const courseFilePath = getCourseFilePath();

    try {
        courseData = await getJSON(courseFilePath);

        if (!courseData) throw new Error("No Data");

        setTimeout(() => {
            let buttons = `<div class="row">`
            courseData.forEach(courseType => {
                const button = `<div class="col-3"><button class="w-100 course-button" onclick="showCourseProgress('${courseType.type}')">${courseType.type}</button></div>`;
                buttons += button;
            });
            buttons += `</div>`;
            $('#song-table').html(buttons);
        }, 100);
    } catch (e) {
        $('#song-table').html(`<div class="col-12 py-5 text-center">無資料<br><small class="text-muted">${courseFilePath}</small><br><small class="text-muted">${e.message}</small></div>`);
    }
}



const showCourseProgress = async (type) => {
    const courseFilePath = getCourseFilePath();

    try {
        courseData = await getJSON(courseFilePath);
        $('#now-title').text(`course|${type}`);
        let courseContent = '';
        courseData.find(x => x.type === type).course.forEach(course => {
            const playedCourse = data.course.find(c => c.type === type);
            let currentCourse = null;
            if (playedCourse != null) {
                currentCourse = playedCourse.courseRecord.find(c => getRecordCourseText(c.courseName) === course.courseName);
            }
            courseContent += `
                <div class="course-block ${currentCourse == null ? 'mb-5' : null} p_0">
                    <div class="course-info text-center mb-3">
                        <div class="col-12 d-flex align-items-center">
                            <div class="section-divider left"></div>
                                <div class="section-divider-title f-20 m-0">
                                    <div class="pt-4 m-0">
                                        <p class="mb-0"><b>${course.courseName}</b></p>
                                        ${currentCourse == null ? '(尚未挑戰)' : currentCourse.isClear ? '合格' : '不合格'}
                                    </div>
                                </div>
                            <div class="section-divider right"></div>
                        </div>
                        <p class="mb-4">Life ${course.totalLives} | great -${course.lifeLossPerJudgement.great} / good -${course.lifeLossPerJudgement.good} / miss -${course.lifeLossPerJudgement.miss} | pass + ${course.lifeRecoveryPerSong}</p>
                    </div>
                    <div id="course-song-card" class="row justify-content-center gap-3">
                        ${course.songs.map((song, index) => {
                let songData = data.songs.find(s => s.title === song.title && s.type === song.type && s.difficulty === song.difficulty);
                if (!songData) {
                    songData = {
                        title: song.title,
                        type: song.type,
                        difficulty: song.difficulty,
                        internalLevel: '?',
                        score: '---',
                        image: 'https://maimaidx-eng.com/maimai-mobile/img/music_icon_back.png', // Default icon or similar
                        rating: undefined
                    };
                }
                let lastPlayedData = null;
                if (currentCourse != null && currentCourse.songs.length >= index) {
                    lastPlayedData = currentCourse.songs[index];
                }
                return `
                                <div style="width:fit-content">
                                    ${createSongCard(songData)}
                                    ${lastPlayedData != null ? `<p class="mt-2 mb-0">成績：${lastPlayedData.score}</p>
                                    <p class="mb-0">命數：${lastPlayedData.life}</p>` : ''}
                                </div>`;
            }).join('')}
                    </div>
                    <div class="course-info text-center mt-3">
                        ${currentCourse != null ? `
                            <p class="mb-2">總成績：${currentCourse.totalScore}、剩餘命數：${currentCourse.remainLife}</p>
                        ` : ''}
                    </div>
                </div>`;
        });
        $('#song-table').html(courseContent);
    } catch (e) {
        $('#song-table').html(`<div class="col-12 py-5 text-center">無資料<br><small class="text-muted">${courseFilePath}</small><br><small class="text-muted">${e.message}</small></div>`);
    }
}
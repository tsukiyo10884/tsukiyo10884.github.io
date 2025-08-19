const showCourseList = async (playerData) => {
    const courseData = await fetch('https://tsukiyo10884.github.io/mai-tools/json/course.json').then(res => res.json());
    const songDetailData = (await fetch('https://dp4p6x0xfi5o9.cloudfront.net/maimai/data.json').then(res => res.json())).songs;
    courseData.forEach(course => {
        $('.result-container').append(`
                <div class="course-block mb-5">
                    <div class="course-info text-center mb-3">
                        <div class="col-12 d-flex align-items-center my-3">
                            <div class="section-divider left"></div>
                                <b class="px-3 section-divider-title f-20">${course.courseName}</b>
                            <div class="section-divider right"></div>
                        </div>
                        <p class="mb-4">Life ${course.totalLives} | great -${course.lifeLossPerJudgement.great} / good -${course.lifeLossPerJudgement.good} / miss -${course.lifeLossPerJudgement.miss} | pass + ${course.lifeRecoveryPerSong}</p>
                    </div>
                    <div class="row justify-content-center gap-3">
                        ${course.songs.map(song => {
                            const songEntry = songDetailData.find(s => s.songId === song.title);
                            const image = `https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/${songEntry?.imageName}`;
                            const sheet = songEntry?.sheets.find(s => s.type === song.type && s.difficulty === song.difficulty);
                            const internalLevelRaw = sheet?.internalLevel ?? sheet?.internalLevelValue;
                            const internalLevel = typeof internalLevelRaw === 'string' ? parseFloat(internalLevelRaw) : internalLevelRaw ?? null;
                            song.image = image;
                            song.internalLevel = internalLevel;
                            song.score = playerData.find(p => p.title === song.title && p.type === song.type && p.difficulty === song.difficulty)?.score || "0.0000%";

                            return createSquareSongCard(song);
                        }).join('')}
                    </div>
                </div>`);
    });
}
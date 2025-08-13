const showClassProgress = (playerData) => {
    $('#classHTML').html(playerData.html);
};

const classes = [
    { id: 0, name: "B5", reqCP: 10, win: { up: 5, same: 5, down: 5, boss: 5 }, lose: { up: 0, same: 0, down: 0 } },
    { id: 1, name: "B4", reqCP: 10, win: { up: 5, same: 5, down: 5, boss: 5 }, lose: { up: 0, same: 0, down: 0 } },
    { id: 2, name: "B3", reqCP: 10, win: { up: 5, same: 5, down: 5, boss: 5 }, lose: { up: 0, same: 0, down: 0 } },
    { id: 3, name: "B2", reqCP: 10, win: { up: 5, same: 5, down: 5, boss: 5 }, lose: { up: 0, same: 0, down: 0 } },
    { id: 4, name: "B1", reqCP: 10, win: { up: 5, same: 5, down: 5, boss: 5 }, lose: { up: 0, same: 0, down: 0 } },
    { id: 5, name: "A5", reqCP: 20, win: { up: 4, same: 4, down: 3, boss: 10 }, lose: { up: 1, same: 1, down: 1 } },
    { id: 6, name: "A4", reqCP: 20, win: { up: 4, same: 4, down: 3, boss: 10 }, lose: { up: 1, same: 1, down: 1 } },
    { id: 7, name: "A3", reqCP: 20, win: { up: 4, same: 4, down: 3, boss: 10 }, lose: { up: 1, same: 1, down: 1 } },
    { id: 8, name: "A2", reqCP: 20, win: { up: 4, same: 4, down: 3, boss: 10 }, lose: { up: 1, same: 1, down: 1 } },
    { id: 9, name: "A1", reqCP: 20, win: { up: 4, same: 4, down: 3, boss: 10 }, lose: { up: 1, same: 1, down: 1 } },
    { id: 10, name: "S5", reqCP: 30, win: { up: 4, same: 3, down: 3, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 11, name: "S4", reqCP: 30, win: { up: 4, same: 3, down: 3, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 12, name: "S3", reqCP: 30, win: { up: 4, same: 3, down: 3, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 13, name: "S2", reqCP: 30, win: { up: 4, same: 3, down: 3, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 14, name: "S1", reqCP: 30, win: { up: 4, same: 3, down: 3, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 15, name: "SS5", reqCP: 50, win: { up: 3, same: 3, down: 2, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 16, name: "SS4", reqCP: 50, win: { up: 3, same: 3, down: 2, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 17, name: "SS3", reqCP: 50, win: { up: 3, same: 3, down: 2, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 18, name: "SS2", reqCP: 50, win: { up: 3, same: 3, down: 2, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 19, name: "SS1", reqCP: 50, win: { up: 3, same: 3, down: 2, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 20, name: "SSS5", reqCP: 60, win: { up: 3, same: 2, down: 2, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 21, name: "SSS4", reqCP: 70, win: { up: 3, same: 2, down: 2, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 22, name: "SSS3", reqCP: 80, win: { up: 3, same: 2, down: 2, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 23, name: "SSS2", reqCP: 90, win: { up: 3, same: 2, down: 1, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 24, name: "SSS1", reqCP: 100, win: { up: 3, same: 2, down: 1, boss: 10 }, lose: { up: 1, same: 2, down: 3 } },
    { id: 25, name: "LEGEND", reqCP: null, win: { up: 1, same: 1, down: 1, boss: 1 }, lose: { up: 1, same: 1, down: 1 } }
];

// 計算到目標階級還差幾分
const countRequiredPoints = (cls, startCP, targetClass) => {
    let totalPoints = 0;
    let currentClass = cls;
    let currentCP = startCP;

    while (currentClass !== targetClass) {
        const classData = classes.find(c => c.name === currentClass);
        if (!classData) break;

        totalPoints += classData.reqCP;
        currentClass = classes[classes.indexOf(classData) + 1]?.name;
    }

    $('#requiredCP').val(totalPoints - currentCP);
};
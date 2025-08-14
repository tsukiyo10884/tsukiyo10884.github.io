const showClassProgress = (playerData) => {
    $('#classHTML').html(playerData.html);
};

const classes = [
    { id: 0, name: "B5", reqCP: 10, win: { up: 5, same: 5, down: 5, boss: 0 }, lose: { up: 0, same: 0, down: 0 } },
    { id: 1, name: "B4", reqCP: 10, win: { up: 5, same: 5, down: 5, boss: 0 }, lose: { up: 0, same: 0, down: 0 } },
    { id: 2, name: "B3", reqCP: 10, win: { up: 5, same: 5, down: 5, boss: 0 }, lose: { up: 0, same: 0, down: 0 } },
    { id: 3, name: "B2", reqCP: 10, win: { up: 5, same: 5, down: 5, boss: 0 }, lose: { up: 0, same: 0, down: 0 } },
    { id: 4, name: "B1", reqCP: 10, win: { up: 5, same: 5, down: 5, boss: 0 }, lose: { up: 0, same: 0, down: 0 } },
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
    { id: 25, name: "LEGEND", reqCP: null, win: { up: 1, same: 1, down: 1, boss: 0 }, lose: { up: 1, same: 1, down: 1 } }
];

// 計算到達目標階級還須打幾場(幾場普通戰跟幾場BOSS戰)
const countRequiredPlay = (ccls, currentCP, tcls) => {
    let normalBattles = 0;
    let totalNormalBattles = 0;
    let totalBossBattles = 0;
    let allBattles = {};

    let currentClass = classes.find(c => c.name === ccls);
    const targetClass = classes.find(c => c.name === tcls);

    // 先算當前位階還差幾場
    let requiredPoints = currentClass.reqCP - currentCP;
    while (requiredPoints > 0) {
        totalNormalBattles++;
        normalBattles++;
        requiredPoints -= currentClass.win.up;
    }

    // A5之前沒有boss戰
    if (currentClass.win.boss != 0) {
        totalBossBattles++;
    }
    allBattles[currentClass.name] = { normal: normalBattles };
    currentClass = classes[currentClass.id + 1];
    normalBattles = 0;

    // 算後續的位階
    while (currentClass != targetClass) {
        // 新的一階從上一階打贏BOSS的點數開始
        requiredPoints = currentClass.reqCP - classes[currentClass.id - 1].win.boss;

        while (requiredPoints > 0) {
            totalNormalBattles++;
            normalBattles++;
            requiredPoints -= currentClass.win.up;
        }

        // A5之前沒有boss戰
        if (currentClass.win.boss != 0) {
            totalBossBattles++;
        }
        allBattles[currentClass.name] = { normal: normalBattles };
        currentClass = classes[currentClass.id + 1];
        normalBattles = 0;
    }

    let result = '<table class="text-center">';
    result += '<tr><th>階級</th><th>所需最短場數</th><th>起始CP</th><th>總需CP</th><th>打贏上位</th><th>打贏同位</th><th>打贏下位</th><th>打輸上位</th><th>打輸同位</th><th>打輸下位</th></tr>';
    Object.keys(allBattles).forEach(element => {
        if (element === "B5") { result += `<tr><td>${element}</td><td>${allBattles[element].normal}場</td><td>0分</td><td>${classes.find(c => c.name === element).reqCP}分</td><td>+${classes.find(c => c.name === element).win.up}分</td><td>+${classes.find(c => c.name === element).win.same}分</td><td>+${classes.find(c => c.name === element).win.down}分</td><td>-${classes.find(c => c.name === element).lose.up}分</td><td>-${classes.find(c => c.name === element).lose.same}分</td><td>-${classes.find(c => c.name === element).lose.down}分</td></tr>`; }
        else { result += `<tr><td>${element}</td><td>${allBattles[element].normal}場</td><td>${classes[classes.find(c => c.name === element).id - 1].win.boss}分</td><td>${classes.find(c => c.name === element).reqCP}分</td><td>+${classes.find(c => c.name === element).win.up}分</td><td>+${classes.find(c => c.name === element).win.same}分</td><td>+${classes.find(c => c.name === element).win.down}分</td><td>-${classes.find(c => c.name === element).lose.up}分</td><td>-${classes.find(c => c.name === element).lose.same}分</td><td>-${classes.find(c => c.name === element).lose.down}分</td></tr>`; }
    });
    result += `<tr><td colspan="10"><b>＞到達目標階級${tcls}為止總共需打贏${totalNormalBattles}場上位，並打贏${totalBossBattles}場BOSS戰＜<br/></b></td></tr>`;
    result += '</table>';
    $('#requiredBattles').html(result);
};
const model = {
  // circle跟cross的位置
  positions: {
    circle: [],
    cross: [],
  },
  // 當前玩家
  currentPlayer: "circle",
  // 勝利條件
  // 橫線(123,456,789)
  row(number) {
    return [(number - 1) * 3 + 1, (number - 1) * 3 + 2, (number - 1) * 3 + 3];
  },
  // 直線(147, 258, 369)
  column(number) {
    return [number, number + 3, number + 6];
  },
  // 結束
  gameoverFlag: false,
  // 結束後不能再按了
  clickingThrottle: false,
};
const view = {
  draw(shape, position) {
    // 判斷是否為OX
    if (shape !== "circle" && shape !== "cross") {
      throw new Error("Unknown drawing shape, must be one of: circle, cross");
    }
    // 呼叫該位置
    const cellDrawed = document.querySelector(
      `#app table tr td[data-index='${position}']`
    );
    cellDrawed.innerHTML = `<div class=${shape}></div>`;
  },
};
const controller = {
  // 因最後要removeEventListener需要有一致的函式名稱
  onClicked(event) {
    controller.onCellClicked(event);
  },
  // 井字遊戲判斷
  onCellClicked(event) {
    // 結束後不能再按了
    if (model.clickingThrottle) return;
    // 取得點選的位置 position
    const position = Number(event.target.dataset.index);
    // 判斷是否已經被畫過了及是否點在井字內
    if (!position || this.isPositionOccupied(position)) return;
    // 記錄點選位置
    this.recordPositions(model.currentPlayer, position);
    // 畫圓或叉
    view.draw(model.currentPlayer, position);
    model.clickingThrottle = true;
    // 因為draw顯示得較慢，所以alert需緩一點執行
    // 判斷是否有勝利者或平手
    setTimeout(() => {
      this.checkWinningCondition(model.currentPlayer, model.positions);
      this.changePlayer();
      // 如果currentplayer是cross且尚未結束即換電腦下
      if (model.currentPlayer === "cross" && !model.gameoverFlag) {
        this.computerMove();
      }
    }, 100);
  },
  // 記錄點選位置
  recordPositions(Player, position) {
    // 記錄position
    if (Player === "circle") {
      model.positions.circle.push(position);
    } else {
      model.positions.cross.push(position);
    }
  },
  // 判斷是否已經被畫過
  isPositionOccupied(position) {
    // 把所有位置合成一個陣列
    const positions = model.positions.circle.concat(model.positions.cross);
    return positions.some((cell) => cell === position);
    // 也可用return positions["circle"].concat(positions["cross"]).includes(position);
  },
  // 判斷是否有勝利者或平手
  checkWinningCondition(player, positions) {
    // 判斷是否成一條線
    if (this.isPlayerWin(player, positions)) {
      model.gameoverFlag = true;
      this.removeClickListeners();
      window.alert(`${player} win`);
    }
    // 判斷是否已經被占滿了
    if (this.getEmptyPositions().length === 0) {
      model.gameoverFlag = true;
      window.alert("Tied");
    }
    model.clickingThrottle = false;
  },
  // 判斷是否成一條線
  isPlayerWin(player, positions) {
    // 不能用positions.player
    for (const checkLine of checkingLines) {
      if (checkLine.every((number) => positions[player].includes(number))) {
        return true;
      }
    }
    // 沒有勝利
    return null;
  },
  // 取得目前棋盤上的空格
  getEmptyPositions() {
    // 建立1~9的陣列
    const arr = Array.from(Array(9).keys(), (x) => x + 1);
    // 用isPositionOccupied判斷是否有空位
    return arr.filter((position) => !this.isPositionOccupied(position));
  },
  changePlayer() {
    if (model.currentPlayer === "circle") {
      model.currentPlayer = "cross";
    } else {
      model.currentPlayer = "circle";
    }
    // currentPlayer = currentPlayer === "circle" ? "cross" : "circle";
  },
  // 結束後移除
  removeClickListeners() {
    // document.querySelectorAll("#app table tr td").forEach((cell) => {
    //   cell.removeEventListener("click", this.onCellClicked);
    // });
    document.querySelectorAll("#app table tr td").forEach((cell) => {
      cell.removeEventListener("click", this.onClicked);
    });
  },
  // 給電腦找最有價值位置
  getMostValuablePosition() {
    // 取得目前還可以下的位置
    const emptyPositions = this.getEmptyPositions();
    // 防禦位置
    const defendPositions = [];
    // 分批將空的位置加入判斷X是否會贏，如果會贏就回傳該位置
    for (const temposition of emptyPositions) {
      // 因為要將空的位置放入positions，但不能影響原本的，所以需要另外設變數儲存，並用Array.from
      const copiedPositions = {
        circle: Array.from(model.positions.circle),
        cross: Array.from(model.positions.cross),
      };
      // 將空的位置加入判斷X是否會贏，如果會贏就回傳該位置
      copiedPositions.cross.push(temposition);
      if (this.isPlayerWin(model.currentPlayer, copiedPositions)) {
        console.log(temposition);
        return temposition;
      }
      // 用此迴圈順便判斷下一個條件，不然又要迴圈一次，僅記錄，迴圈沒結束再回傳
      copiedPositions.circle.push(temposition);
      if (this.isPlayerWin("circle", copiedPositions)) {
        defendPositions.push(temposition);
      }
    }
    // 如果都沒有的話，就判斷哪一個位置使用者(o)會贏，如果有的話就回傳該位置
    if (defendPositions.length !== 0) {
      return defendPositions[0];
    }
    // 如果還是沒有的話，如果有中間位置就下
    if (emptyPositions.some((index) => index === 5)) {
      return 5;
    }
    // 如果什麼都沒有，就隨機下一個位置
    return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  },
  // 電腦下
  computerMove() {
    // 找最有利的位置
    const mostValuablePosition = this.getMostValuablePosition();
    // 下在取得最有利的位置
    view.draw(model.currentPlayer, mostValuablePosition);
    // 記錄下的位置
    this.recordPositions(model.currentPlayer, mostValuablePosition);
    model.clickingThrottle = true;
    setTimeout(() => {
      // 確認是否贏了
      this.checkWinningCondition(model.currentPlayer, model.positions);
      // 沒有就換user下
      this.changePlayer();
    }, 100);
  },
};

//加入勝利條件
// 橫線, 直線, 斜線(159,357)
const checkingLines = [
  model.row(1),
  model.row(2),
  model.row(3),
  model.column(1),
  model.column(2),
  model.column(3),
  [1, 5, 9],
  [3, 5, 7],
];

//對每一個位置設置監聽器
document.querySelectorAll("#app table tr td").forEach((cell) => {
  cell.addEventListener("click", controller.onClicked);
});

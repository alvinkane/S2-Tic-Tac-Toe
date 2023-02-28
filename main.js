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
};
const view = {
  draw(shape, position) {
    // 呼叫該位置
    const cellDrawed = document.querySelector(
      `#app table tr td[data-index='${position}']`
    );
    cellDrawed.innerHTML = `<div class=${shape}></div>`;
  },
};
const controller = {
  // 井字遊戲判斷
  onClicked(event) {
    controller.onCellClicked(event);
  },
  onCellClicked(event) {
    // 取得點選的位置 position
    const position = Number(event.target.dataset.index);
    // 判斷是否已經被畫過了及是否點在井字內
    if (!position || this.isPositionOccupied(position)) return;
    // 記錄點選位置
    this.recordPositions(model.currentPlayer, position);
    // 畫圓或叉
    view.draw(model.currentPlayer, position);
    // 因為draw顯示得較慢，所以alert需緩一點執行
    // 判斷是否有勝利者或平手
    setTimeout(() => {
      this.checkWinningCondition(model.currentPlayer, model.positions);
      this.changePlayer();
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
  },
  // 判斷是否有勝利者或平手
  checkWinningCondition(player, positions) {
    // 判斷是否成一條線
    if (this.isPlayerWin(player, positions)) {
      this.removeClickListeners();
      window.alert(`${player} win`);
    }
    // 判斷是否已經被占滿了
    if (this.getEmptyPositions().length === 0) {
      window.alert("Tied");
    }
  },
  // 判斷是否成一條線
  isPlayerWin(player, positions) {
    // 不能用positions.player
    for (const checkLine of checkingLines) {
      if (checkLine.every((number) => positions[player].includes(number))) {
        return true;
      }
    }
  },
  // 找空位
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
// document.querySelectorAll("#app table tr td").forEach((cell) => {
//   cell.addEventListener("click", function onClicked(event) {
//     controller.onCellClicked(event);
//   });
// });
document.querySelectorAll("#app table tr td").forEach((cell) => {
  cell.addEventListener("click", controller.onClicked);
});

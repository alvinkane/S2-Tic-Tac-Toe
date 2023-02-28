const model = {
  // circle跟cross的位置
  positions: {
    circle: [],
    cross: [],
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
  // 當前玩家
  currentPlayer: "circle",
  // 井字遊戲判斷
  onCellClicked(event) {
    // 取得點選的位置 position
    const position = Number(event.target.dataset.index);
    // 判斷是否已經被畫過了及是否點在井字內
    if (!position || this.isPositionOccupied(position)) return;
    // 記錄點選位置
    this.recordPositions(this.currentPlayer, position);
    // 畫圓或叉
    view.draw(this.currentPlayer, position);
  },
  // 記錄點選位置
  recordPositions(Player, position) {
    // 判斷代入的currentPlayer為circle或cross
    if (Player !== ("circle" || "cross")) return;
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
};

//對每一個位置設置監聽器
document.querySelectorAll("#app table tr td").forEach((cell) => {
  cell.addEventListener("click", (event) => {
    controller.onCellClicked(event);
  });
});

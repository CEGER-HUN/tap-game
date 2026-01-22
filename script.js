let points = parseInt(localStorage.getItem("points")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;
let clickPower = parseInt(localStorage.getItem("clickPower")) || 1;
let autoClickers = parseInt(localStorage.getItem("autoClickers")) || 0;

const pointsEl = document.getElementById("points");
const levelEl = document.getElementById("level");
const xpFill = document.getElementById("xpFill");
const coin = document.getElementById("coin");

function levelRequirement(lvl) {
  return lvl * 150;
}

function updateUI() {
  pointsEl.textContent = points;
  levelEl.textContent = level;

  let needed = levelRequirement(level);
  let progress = (points / needed) * 100;
  xpFill.style.width = Math.min(progress, 100) + "%";

  localStorage.setItem("points", points);
  localStorage.setItem("level", level);
  localStorage.setItem("clickPower", clickPower);
  localStorage.setItem("autoClickers", autoClickers);
}

coin.addEventListener("click", () => {
  points += clickPower;
  checkLevelUp();
  updateUI();
});

function checkLevelUp() {
  if (points >= levelRequirement(level)) {
    level++;
  }
}

function buyClickPower() {
  if (points >= 100) {
    points -= 100;
    clickPower++;
    updateUI();
  } else {
    alert("Not enough points!");
  }
}

function buyAutoClicker() {
  if (points >= 250) {
    points -= 250;
    autoClickers++;
    updateUI();
  } else {
    alert("Not enough points!");
  }
}

setInterval(() => {
  points += autoClickers;
  checkLevelUp();
  updateUI();
}, 1000);

updateUI();

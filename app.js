let score = 0;
let energy = 50;

const scoreEl = document.getElementById("score");
const energyEl = document.getElementById("energy");
const tapItem = document.getElementById("tapItem");

tapItem.onclick = () => {
  if (energy <= 0) return;

  score++;
  energy--;

  scoreEl.innerText = score;
  energyEl.innerText = energy;
};

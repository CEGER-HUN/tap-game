let coins = 0;

const counter = document.getElementById("counter");
const coin = document.getElementById("coin");

coin.addEventListener("click", () => {
  coins++;
  counter.innerText = "Coins: " + coins;
});

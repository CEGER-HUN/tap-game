let gameState = {
    score: 0, level: 1, xp: 0, xpToNextLevel: 100,
    clickPower: 1, passiveIncome: 0,
    energy: 1000, maxEnergy: 1000, energyRegenRate: 0.2,
    lastUpdate: Date.now(),
    cards: {
        lemonade: { level: 0, baseCost: 100, yield: 1 },
        store: { level: 0, baseCost: 500, yield: 5 },
        factory: { level: 0, baseCost: 2500, yield: 25 }
    }
};

let combo = 1;
let comboTimer = 0;

window.onload = () => {
    loadGame();
    calculateOfflineEarnings();
    setInterval(gameLoop, 100);
    setInterval(saveGame, 5000);
    updateUI();
};

function gameLoop() {
    gameState.score += (gameState.passiveIncome / 10);
    if (gameState.energy < gameState.maxEnergy) gameState.energy += (gameState.energyRegenRate / 10);
    
    if (comboTimer > 0) {
        comboTimer -= 1;
        document.getElementById('combo-fill').style.width = comboTimer + "%";
        document.getElementById('combo-text').style.opacity = "1";
    } else {
        combo = 1;
        document.getElementById('combo-text').style.opacity = "0";
    }
    updateUI();
}

document.getElementById('main-coin').addEventListener('click', (e) => {
    if (gameState.energy < 1) return;
    comboTimer = 100;
    if (combo < 10) combo += 0.05;
    
    let gain = gameState.clickPower * Math.floor(combo);
    gameState.score += gain;
    gameState.xp += 1;
    gameState.energy -= 1;
    
    if (gameState.xp >= gameState.xpToNextLevel) {
        gameState.level++;
        gameState.xp = 0;
        gameState.xpToNextLevel *= 1.5;
    }
    updateUI();
});

function buyCard(cardId) {
    let card = gameState.cards[cardId];
    let cost = Math.floor(card.baseCost * Math.pow(1.5, card.level));
    if (gameState.score >= cost) {
        gameState.score -= cost;
        card.level++;
        gameState.passiveIncome += card.yield;
        updateUI();
    }
}

function updateUI() {
    document.getElementById('score').innerText = Math.floor(gameState.score).toLocaleString();
    document.getElementById('hourly-income').innerText = (gameState.passiveIncome * 3600).toLocaleString();
    document.getElementById('energy-text').innerText = `${Math.floor(gameState.energy)}/1000`;
    document.getElementById('combo-text').innerText = `COMBO X${Math.floor(combo)}`;
    
    for (let id in gameState.cards) {
        let c = gameState.cards[id];
        let cost = Math.floor(c.baseCost * Math.pow(1.5, c.level));
        document.getElementById(`price-${id}`).innerText = cost.toLocaleString();
    }
}

function saveGame() { 
    gameState.lastUpdate = Date.now();
    localStorage.setItem('tapGameSave', JSON.stringify(gameState)); 
}
function loadGame() {
    const saved = localStorage.getItem('tapGameSave');
    if (saved) gameState = Object.assign(gameState, JSON.parse(saved));
}
function calculateOfflineEarnings() {
    let diff = Math.floor((Date.now() - gameState.lastUpdate) / 1000);
    if (diff > 10 && gameState.passiveIncome > 0) {
        let earned = diff * gameState.passiveIncome;
        gameState.score += earned;
        alert(`Hoş geldin! Sen yokken ${earned} coin kazandın.`);
    }
}

let gameState = {
    score: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    clickPower: 1,
    passiveIncome: 0, // Saniyelik kazanç
    clickCount: 0,
    lastDaily: null,
    energy: 1000,
    maxEnergy: 1000,
    energyRegenRate: 0.2, 
    energyCostPerClick: 1,
    lastUpdate: Date.now(),
    tasks: [
        { id: 1, description: "100 Tıklama", target: 100, reward: 50, completed: false },
        { id: 2, description: "1000 Puan", target: 1000, reward: 200, completed: false }
    ]
};

// Kombo Değişkenleri
let combo = 1;
let comboTimer = 0;
const COMBO_MAX_TIME = 100; // 2 saniye (20ms * 100)

const scoreEl = document.getElementById('score');
const xpFill = document.getElementById('xp-fill');
const energyFill = document.getElementById('energy-fill');
const comboFill = document.getElementById('combo-fill');
const comboText = document.getElementById('combo-text');
const coin = document.getElementById('main-coin');

window.onload = () => {
    loadGame();
    calculateOfflineEarnings();
    setInterval(gameLoop, 100); // 0.1 saniyede bir güncelle
    setInterval(saveGame, 5000);
    animateScore();
};

function gameLoop() {
    // Pasif Kazanç (Saniyede bir ekle)
    gameState.score += (gameState.passiveIncome / 10);
    
    // Enerji Yenileme
    if (gameState.energy < gameState.maxEnergy) {
        gameState.energy += (gameState.energyRegenRate / 10);
    }

    // Kombo Azaltma
    if (comboTimer > 0) {
        comboTimer -= 1;
        comboFill.style.width = comboTimer + "%";
        comboText.style.opacity = "1";
    } else {
        combo = 1;
        comboText.style.opacity = "0";
        document.body.classList.remove('frenzy-mode');
    }
    
    updateUI();
}

coin.addEventListener('click', (e) => {
    if (gameState.energy < gameState.energyCostPerClick) return;

    // Kombo Artır
    comboTimer = COMBO_MAX_TIME;
    if (combo < 10) combo += 0.1; 
    if (combo >= 5) document.body.classList.add('frenzy-mode');

    let gain = gameState.clickPower * Math.floor(combo);
    gameState.score += gain;
    gameState.xp += 1;
    gameState.energy -= gameState.energyCostPerClick;

    if (gameState.xp >= gameState.xpToNextLevel) levelUp();

    createFloatingText(e.clientX, e.clientY, `+${gain} (x${Math.floor(combo)})`);
    updateUI();
});

function buyPassive() {
    let cost = 100 + (gameState.passiveIncome * 10);
    if (gameState.score >= cost) {
        gameState.score -= cost;
        gameState.passiveIncome += 1; // Saniyede +1 coin
        updateUI();
    }
}

function updateUI() {
    scoreEl.innerText = Math.floor(gameState.score).toLocaleString();
    document.getElementById('level-val').innerText = gameState.level;
    document.getElementById('hourly-income').innerText = (gameState.passiveIncome * 3600).toLocaleString();
    document.getElementById('energy-text').innerText = `${Math.floor(gameState.energy)} / ${gameState.maxEnergy}`;
    document.getElementById('buy-passive').innerText = 100 + (gameState.passiveIncome * 10);
    document.getElementById('buy-click').innerText = 50 * gameState.clickPower;
    xpFill.style.width = (gameState.xp / gameState.xpToNextLevel * 100) + "%";
    energyFill.style.width = (gameState.energy / gameState.maxEnergy * 100) + "%";
    comboText.innerText = `COMBO X${Math.floor(combo)}`;
}

function calculateOfflineEarnings() {
    let now = Date.now();
    let diff = Math.floor((now - gameState.lastUpdate) / 1000); // saniye cinsinden
    if (diff > 10 && gameState.passiveIncome > 0) {
        let earned = diff * gameState.passiveIncome;
        gameState.score += earned;
        alert(`Hoş geldin! Sen yokken ${earned} coin kazandın.`);
    }
    gameState.lastUpdate = now;
}

function levelUp() {
    gameState.level++;
    gameState.xp = 0;
    gameState.xpToNextLevel *= 1.5;
    gameState.score += gameState.level * 100;
    alert("LEVEL UP!");
}

// ... createFloatingText ve diğer yardımcı fonksiyonlar aynı kalacak ...

function saveGame() {
    gameState.lastUpdate = Date.now();
    localStorage.setItem('tapGameSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('tapGameSave');
    if (saved) {
        gameState = Object.assign(gameState, JSON.parse(saved));
    }
}

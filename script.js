let gameState = {
    score: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    clickPower: 1,
    boosterActive: false,
    clickCount: 0,
    lastDaily: null,
    energy: 1000,
    maxEnergy: 1000,
    energyRegenRate: 0.1, // 10 saniyede +1 enerji
    energyCostPerClick: 1,
    tasks: [
        { id: 1, description: "100 Tıklama", target: 100, reward: 50, completed: false },
        { id: 2, description: "1000 Puan", target: 1000, reward: 200, completed: false },
        { id: 3, description: "Level 5'e Ulaş", target: 5, reward: 500, completed: false }
    ]
};

const scoreEl = document.getElementById('score');
const xpFill = document.getElementById('xp-fill');
const xpText = document.getElementById('xp-text');
const levelText = document.getElementById('level-text');
const coin = document.getElementById('main-coin');
const coinContainer = document.getElementById('coin-container');
const energyFill = document.getElementById('energy-fill');
const energyText = document.getElementById('energy-text');

let displayScore = 0;

window.onload = () => {
    loadGame();
    displayScore = gameState.score;
    updateUI();
    setInterval(regenerateEnergy, 1000);
    setInterval(saveGame, 5000);
    animateScore();
};

function animateScore() {
    if (Math.abs(displayScore - gameState.score) > 0.1) {
        displayScore += (gameState.score - displayScore) * 0.2;
        scoreEl.innerText = Math.floor(displayScore).toLocaleString();
    } else {
        displayScore = gameState.score;
        scoreEl.innerText = Math.floor(displayScore).toLocaleString();
    }
    requestAnimationFrame(animateScore);
}

coin.addEventListener('click', (e) => {
    if (gameState.energy < gameState.energyCostPerClick) return;
    
    let gain = gameState.clickPower * (gameState.boosterActive ? 2 : 1);
    gameState.score += gain;
    gameState.xp += Math.ceil(gain / 2);
    gameState.clickCount++;
    gameState.energy -= gameState.energyCostPerClick;

    if (gameState.xp >= gameState.xpToNextLevel) levelUp();

    const rect = coinContainer.getBoundingClientRect();
    createFloatingText(e.clientX - rect.left, e.clientY - rect.top, `+${gain}`);
    updateUI();
    checkTasks();
});

function regenerateEnergy() {
    if (gameState.energy < gameState.maxEnergy) {
        gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + gameState.energyRegenRate);
        updateUI();
    }
}

function updateUI() {
    if (levelText) levelText.innerText = `Level ${gameState.level}`;
    if (xpText) xpText.innerText = `${gameState.xp} / ${gameState.xpToNextLevel} XP`;
    if (xpFill) xpFill.style.width = `${(gameState.xp / gameState.xpToNextLevel) * 100}%`;
    
    const curEnergy = Math.floor(gameState.energy);
    if (energyText) energyText.innerText = `${curEnergy} / ${gameState.maxEnergy}`;
    if (energyFill) energyFill.style.width = `${(curEnergy / gameState.maxEnergy) * 100}%`;
    
    if (document.getElementById('buy-click')) document.getElementById('buy-click').innerText = 50 * gameState.clickPower;
    if (document.getElementById('buy-boost')) document.getElementById('buy-boost').innerText = 500;
}

function buyClickPower() {
    let cost = 50 * gameState.clickPower;
    if (gameState.score >= cost) {
        gameState.score -= cost;
        gameState.clickPower++;
        updateUI();
    }
}

function buyBooster() {
    if (gameState.score >= 500 && !gameState.boosterActive) {
        gameState.score -= 500;
        gameState.boosterActive = true;
        setTimeout(() => { gameState.boosterActive = false; updateUI(); }, 30000);
        updateUI();
    }
}

function showTab(type) {
    document.getElementById(type + '-modal').style.display = 'block';
    if(type === 'tasks') renderTasks();
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = gameState.tasks.map(t => `<div class="item"><h4>${t.description} ${t.completed ? '✅' : ''}</h4><b>+${t.reward} 💰</b></div>`).join('');
}

function levelUp() {
    gameState.level++;
    gameState.xp = 0;
    gameState.xpToNextLevel *= 1.5;
    gameState.score += gameState.level * 50;
    updateUI();
}

function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    coinContainer.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function saveGame() { localStorage.setItem('tapGameSave', JSON.stringify(gameState)); }
function loadGame() {
    const saved = localStorage.getItem('tapGameSave');
    if (saved) {
        gameState = Object.assign(gameState, JSON.parse(saved));
        gameState.energy = 1000; // Başlangıçta doldur
    }
}
function claimDailyBonus() {
    const today = new Date().toDateString();
    if (gameState.lastDaily !== today) {
        gameState.score += 200;
        gameState.lastDaily = today;
        updateUI();
    }
}

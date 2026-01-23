let gameState = {
    score: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    clickPower: 1,
    autoClicker: 0,
    boosterActive: false,
    clickCount: 0,
    lastDaily: null,
    energy: 1000,
    maxEnergy: 1000,
    energyRegenRate: 0.1, // 10 saniyede +1 enerji (1 / 10 = 0.1)
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
    setInterval(runAutoClickers, 1000);
    setInterval(regenerateEnergy, 1000);
    setInterval(saveGame, 5000);
    animateScore();
};

function animateScore() {
    if (Math.abs(displayScore - gameState.score) > 0.1) {
        displayScore += (gameState.score - displayScore) * 0.2;
        if (scoreEl) scoreEl.innerText = Math.floor(displayScore).toLocaleString();
    } else {
        displayScore = gameState.score;
        if (scoreEl) scoreEl.innerText = Math.floor(displayScore).toLocaleString();
    }
    requestAnimationFrame(animateScore);
}

coin.addEventListener('click', (e) => {
    if (gameState.energy < gameState.energyCostPerClick) {
        showNotification('⚡ Enerji Yok! Bekle...', 'error');
        return;
    }
    
    let gain = gameState.clickPower;
    if (gameState.boosterActive) gain *= 2;
    
    gameState.score += gain;
    gameState.xp += Math.ceil(gain / 2);
    gameState.clickCount++;
    gameState.energy -= gameState.energyCostPerClick;

    if (gameState.xp >= gameState.xpToNextLevel) levelUp();

    const rect = coinContainer.getBoundingClientRect();
    createFloatingText(e.clientX - rect.left, e.clientY - rect.top, `+${gain}`);
    createParticles(e.clientX - rect.left, e.clientY - rect.top);
    
    updateUI();
    checkTasks();
});

function regenerateEnergy() {
    if (isNaN(gameState.energy)) gameState.energy = 0;
    if (gameState.energy < gameState.maxEnergy) {
        gameState.energy += gameState.energyRegenRate;
        if (gameState.energy > gameState.maxEnergy) gameState.energy = gameState.maxEnergy;
        updateUI();
    }
}

function updateUI() {
    if (levelText) levelText.innerText = `Level ${gameState.level}`;
    if (xpText) xpText.innerText = `${gameState.xp} / ${gameState.xpToNextLevel} XP`;
    if (xpFill) xpFill.style.width = `${(gameState.xp / gameState.xpToNextLevel) * 100}%`;
    
    const currentEnergy = Math.floor(gameState.energy || 0);
    if (energyText) energyText.innerText = `${currentEnergy} / ${gameState.maxEnergy}`;
    if (energyFill) {
        const energyPercent = (currentEnergy / gameState.maxEnergy) * 100;
        energyFill.style.width = `${energyPercent}%`;
        energyFill.style.background = energyPercent < 20 ? '#ff3333' : 'linear-gradient(90deg, #00ff88, #00d9ff)';
    }
    
    if (document.getElementById('buy-click')) document.getElementById('buy-click').innerText = 50 * gameState.clickPower;
    if (document.getElementById('buy-auto')) document.getElementById('buy-auto').innerText = 100 * (gameState.autoClicker + 1);
}

function buyClickPower() {
    let cost = 50 * gameState.clickPower;
    if (gameState.score >= cost) {
        gameState.score -= cost;
        displayScore = gameState.score;
        gameState.clickPower++;
        showNotification('✨ Güç Arttı!', 'success');
        updateUI();
    } else {
        showNotification('❌ Yetersiz Coin!', 'error');
    }
}

function buyAutoClicker() {
    let cost = 100 * (gameState.autoClicker + 1);
    if (gameState.score >= cost) {
        gameState.score -= cost;
        displayScore = gameState.score;
        gameState.autoClicker++;
        showNotification('🤖 Bot Alındı!', 'success');
        updateUI();
    } else {
        showNotification('❌ Yetersiz Coin!', 'error');
    }
}

function showNotification(msg, type) {
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.innerText = msg;
    n.style.cssText = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#a855f7;color:#fff;padding:10px 20px;border-radius:10px;z-index:9999;";
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2000);
}

function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.cssText = `position:absolute;left:${x}px;top:${y}px;color:#fff;pointer-events:none;animation:floatUp 0.8s forwards;`;
    coinContainer.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function createParticles(x, y) {
    for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:5px;height:5px;background:#ffd700;border-radius:50%;`;
        coinContainer.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }
}

function saveGame() {
    localStorage.setItem('tapGameSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('tapGameSave');
    if (saved) {
        const loadedState = JSON.parse(saved);
        if (loadedState.maxEnergy !== 1000) loadedState.maxEnergy = 1000;
        gameState = { ...gameState, ...loadedState };
    }
}

function runAutoClickers() {
    if (gameState.autoClicker > 0) {
        gameState.score += gameState.autoClicker;
        updateUI();
    }
}

function levelUp() {
    gameState.level++;
    gameState.xp = 0;
    gameState.xpToNextLevel = Math.floor(gameState.xpToNextLevel * 1.5);
    showNotification(`🎉 LEVEL ${gameState.level}!`, 'success');
}

function checkTasks() {
    gameState.tasks.forEach(t => {
        if (!t.completed) {
            if ((t.id === 1 && gameState.clickCount >= t.target) || (t.id === 2 && gameState.score >= t.target)) {
                t.completed = true;
                gameState.score += t.reward;
                showNotification(`✅ Görev: ${t.description}`, 'success');
            }
        }
    });
}

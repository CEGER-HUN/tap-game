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
    setInterval(runAutoClickers, 1000);
    setInterval(regenerateEnergy, 1000); // Enerji dolumu aktif
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

// TIKLAMA FONKSİYONU
coin.addEventListener('click', (e) => {
    if (gameState.energy < gameState.energyCostPerClick) {
        showNotification('⚡ Enerji Yok!', 'error');
        return;
    }
    
    let gain = gameState.clickPower;
    if (gameState.boosterActive) gain *= 2;
    
    gameState.score += gain;
    gameState.xp += Math.ceil(gain / 2);
    gameState.clickCount++;
    gameState.energy -= gameState.energyCostPerClick; // Enerji düşer

    if (gameState.xp >= gameState.xpToNextLevel) levelUp();

    // Görsel Efektler
    const rect = coinContainer.getBoundingClientRect();
    createFloatingText(e.clientX - rect.left, e.clientY - rect.top, `+${gain}`);
    
    updateUI();
    checkTasks();
});

function regenerateEnergy() {
    if (isNaN(gameState.energy)) gameState.energy = 0;
    if (gameState.energy < gameState.maxEnergy) {
        gameState.energy += 0.1; // 10 saniyede 1 enerji
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
    }

    // Market fiyatlarını güncelle
    if (document.getElementById('buy-click')) document.getElementById('buy-click').innerText = 50 * gameState.clickPower;
    if (document.getElementById('buy-auto')) document.getElementById('buy-auto').innerText = 100 * (gameState.autoClicker + 1);
}

// MARKET DÜZELTME: Coin azalmasını sağlar
function buyClickPower() {
    let cost = 50 * gameState.clickPower;
    if (gameState.score >= cost) {
        gameState.score -= cost;
        displayScore = gameState.score; // UI anında güncellensin
        gameState.clickPower++;
        showNotification('✨ Güç Artırıldı!', 'success');
        updateUI();
        saveGame();
    } else {
        showNotification('❌ Coin Yetersiz!', 'error');
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
        saveGame();
    } else {
        showNotification('❌ Coin Yetersiz!', 'error');
    }
}

function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.position = 'absolute';
    el.style.color = 'white';
    el.style.fontWeight = 'bold';
    el.style.pointerEvents = 'none';
    coinContainer.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function showNotification(message) {
    console.log(message); // Bildirim sistemi hataya yol açmaması için konsola yazdırıyoruz
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
}

function checkTasks() {
    gameState.tasks.forEach(t => {
        if (!t.completed) {
            if ((t.id === 1 && gameState.clickCount >= t.target) || (t.id === 2 && gameState.score >= t.target)) {
                t.completed = true;
                gameState.score += t.reward;
            }
        }
    });
}

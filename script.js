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
    energyRegenRate: 1,
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
    // İlk yüklemede skoru eşitle ki animasyon 0'dan başlamasın
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
    // Enerji Kontrolü
    if (gameState.energy < gameState.energyCostPerClick) {
        showNotification('⚡ Enerji Yok! Bekle...', 'error');
        coin.classList.add('shake');
        setTimeout(() => coin.classList.remove('shake'), 500);
        return;
    }
    
    let gain = gameState.clickPower;
    if (gameState.boosterActive) gain *= 2;
    
    gameState.score += gain;
    gameState.xp += Math.ceil(gain / 2);
    gameState.clickCount++;
    
    // Enerjiyi Azalt
    gameState.energy -= gameState.energyCostPerClick;
    
    if (gameState.xp >= gameState.xpToNextLevel) {
        levelUp();
    }

    // Efektler
    const rect = coinContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    createFloatingText(clickX, clickY, `+${gain}`);
    createParticles(clickX, clickY);
    
    updateUI();
    checkTasks();
});

function regenerateEnergy() {
    if (gameState.energy < gameState.maxEnergy) {
        gameState.energy += gameState.energyRegenRate;
        if (gameState.energy > gameState.maxEnergy) gameState.energy = gameState.maxEnergy;
        updateUI();
    }
}

function updateUI() {
    // Level & XP
    if (levelText) levelText.innerText = `Level ${gameState.level}`;
    if (xpText) xpText.innerText = `${gameState.xp} / ${gameState.xpToNextLevel} XP`;
    if (xpFill) xpFill.style.width = `${(gameState.xp / gameState.xpToNextLevel) * 100}%`;
    
    // Enerji UI
    if (energyText) energyText.innerText = `${Math.floor(gameState.energy)} / ${gameState.maxEnergy}`;
    if (energyFill) {
        const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
        energyFill.style.width = `${energyPercent}%`;
        
        // Renk Değişimi
        if (energyPercent < 20) energyFill.style.background = '#ff3333';
        else if (energyPercent < 50) energyFill.style.background = '#ffaa00';
        else energyFill.style.background = 'linear-gradient(90deg, #00ff88, #00d9ff)';
    }
    
    // Market Fiyatları (Elementler varsa güncelle)
    const clickValEl = document.getElementById('click-inc-val');
    const autoValEl = document.getElementById('auto-inc-val');
    const buyClickBtn = document.getElementById('buy-click');
    const buyAutoBtn = document.getElementById('buy-auto');

    if (clickValEl) clickValEl.innerText = `+${gameState.clickPower}`;
    if (autoValEl) autoValEl.innerText = gameState.autoClicker;
    if (buyClickBtn) buyClickBtn.innerText = 50 * gameState.clickPower;
    if (buyAutoBtn) buyAutoBtn.innerText = 100 * (gameState.autoClicker + 1);
}

// MARKET FONKSİYONLARI (DÜZELTİLDİ)
function buyClickPower() {
    let cost = 50 * gameState.clickPower;
    if (gameState.score >= cost) {
        gameState.score -= cost; // Puanı düşür
        displayScore = gameState.score; // Animasyonu güncelle
        gameState.clickPower++;
        showNotification('✨ Click Power Yükseltildi!', 'success');
        updateUI();
        saveGame();
    } else {
        showNotification('❌ Yetersiz Coin!', 'error');
    }
}

function buyAutoClicker() {
    let cost = 100 * (gameState.autoClicker + 1);
    if (gameState.score >= cost) {
        gameState.score -= cost; // Puanı düşür
        displayScore = gameState.score; // Animasyonu güncelle
        gameState.autoClicker++;
        showNotification('🤖 Auto Clicker Alındı!', 'success');
        updateUI();
        saveGame();
    } else {
        showNotification('❌ Yetersiz Coin!', 'error');
    }
}

// ... (Diğer fonksiyonlar: saveGame, loadGame, createParticles vb. aynı kalabilir)

function saveGame() {
    localStorage.setItem('tapGameSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('tapGameSave');
    if (saved) {
        const loadedState = JSON.parse(saved);
        // Enerji kontrolü (Eski kayıtlarda yoksa ekle)
        if (loadedState.energy === undefined) loadedState.energy = 1000;
        gameState = loadedState;
    }
}

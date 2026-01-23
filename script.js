// --- OYUN DURUMU (STATE) ---
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
    energyRegenRate: 0.1, // 10 saniyede +1 enerji (saniyede 0.1)
    energyCostPerClick: 1,
    tasks: [
        { id: 1, description: "100 Tıklama", target: 100, reward: 50, completed: false },
        { id: 2, description: "1000 Puan", target: 1000, reward: 200, completed: false },
        { id: 3, description: "Level 5'e Ulaş", target: 5, reward: 500, completed: false }
    ]
};

// --- ELEMENTLER ---
const scoreEl = document.getElementById('score');
const xpFill = document.getElementById('xp-fill');
const xpText = document.getElementById('xp-text');
const levelText = document.getElementById('level-text');
const coin = document.getElementById('main-coin');
const coinContainer = document.getElementById('coin-container');
const energyFill = document.getElementById('energy-fill');
const energyText = document.getElementById('energy-text');

let displayScore = 0;

// --- BAŞLANGIÇ ---
window.onload = () => {
    loadGame();
    displayScore = gameState.score;
    updateUI();
    
    // Döngüsel işlemler
    setInterval(runAutoClickers, 1000);
    setInterval(regenerateEnergy, 1000); 
    setInterval(saveGame, 5000);
    animateScore();
};

// --- AKICI SKOR ANİMASYONU ---
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

// --- TIKLAMA MANTIĞI ---
coin.addEventListener('click', (e) => {
    // Enerji Kontrolü
    if (gameState.energy < gameState.energyCostPerClick) {
        showNotification('⚡ Enerji Yok! Bekle...', 'error');
        // CSS'indeki shake animasyonunu tetikle
        coin.style.animation = 'shake 0.5s';
        setTimeout(() => { coin.style.animation = 'float 3s ease-in-out infinite'; }, 500);
        return;
    }
    
    let gain = gameState.clickPower;
    if (gameState.boosterActive) gain *= 2;
    
    // Verileri Güncelle
    gameState.score += gain;
    gameState.xp += Math.ceil(gain / 2);
    gameState.clickCount++;
    gameState.energy -= gameState.energyCostPerClick;

    // Level Kontrolü
    if (gameState.xp >= gameState.xpToNextLevel) levelUp();

    // Görsel Efektler (CSS ile uyumlu)
    const rect = coinContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    createFloatingText(clickX, clickY, `+${gain}`);
    createParticles(clickX, clickY);
    
    updateUI();
    checkTasks();
});

// --- ENERJİ SİSTEMİ (10 SN = 1 ENERJİ) ---
function regenerateEnergy() {
    if (isNaN(gameState.energy)) gameState.energy = 0;
    if (gameState.energy < gameState.maxEnergy) {
        gameState.energy += gameState.energyRegenRate;
        if (gameState.energy > gameState.maxEnergy) gameState.energy = gameState.maxEnergy;
        updateUI();
    }
}

// --- ARAYÜZ GÜNCELLEME ---
function updateUI() {
    if (levelText) levelText.innerText = `Level ${gameState.level}`;
    if (xpText) xpText.innerText = `${gameState.xp} / ${gameState.xpToNextLevel} XP`;
    if (xpFill) xpFill.style.width = `${(gameState.xp / gameState.xpToNextLevel) * 100}%`;
    
    const curEnergy = Math.floor(gameState.energy || 0);
    if (energyText) energyText.innerText = `${curEnergy} / ${gameState.maxEnergy}`;
    if (energyFill) energyFill.style.width = `${(curEnergy / gameState.maxEnergy) * 100}%`;
    
    // Market Değerleri
    if (document.getElementById('click-inc-val')) document.getElementById('click-inc-val').innerText = `+${gameState.clickPower}`;
    if (document.getElementById('auto-inc-val')) document.getElementById('auto-inc-val').innerText = gameState.autoClicker;
    if (document.getElementById('buy-click')) document.getElementById('buy-click').innerText = 50 * gameState.clickPower;
    if (document.getElementById('buy-auto')) document.getElementById('buy-auto').innerText = 100 * (gameState.autoClicker + 1);
}

// --- MARKET VE PENCERELER ---
function showTab(type) {
    const modal = document.getElementById(type + '-modal');
    if (modal) {
        modal.style.display = 'block';
        if (type === 'tasks') renderTasks();
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function buyClickPower() {
    let cost = 50 * gameState.clickPower;
    if (gameState.score >= cost) {
        gameState.score -= cost;
        displayScore = gameState.score; // Anında güncelle
        gameState.clickPower++;
        showNotification('✨ Tıklama Gücü Artırıldı!', 'success');
        updateUI();
        saveGame();
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
        showNotification('🤖 Auto Bot Alındı!', 'success');
        updateUI();
        saveGame();
    } else {
        showNotification('❌ Yetersiz Coin!', 'error');
    }
}

function buyBooster() {
    const cost = 500;
    if (gameState.score >= cost && !gameState.boosterActive) {
        gameState.score -= cost;
        displayScore = gameState.score;
        gameState.boosterActive = true;
        showNotification('🚀 2x Booster Aktif! (30sn)', 'success');
        
        setTimeout(() => {
            gameState.boosterActive = false;
            showNotification('⏰ Booster Süresi Doldu', 'info');
        }, 30000);
        updateUI();
    } else if(gameState.boosterActive) {
        showNotification('⏳ Zaten Aktif!', 'info');
    } else {
        showNotification('❌ Yetersiz Coin!', 'error');
    }
}

// --- LEVEL UP VE EFEKTLER ---
function levelUp() {
    gameState.level++;
    gameState.xp = 0;
    gameState.xpToNextLevel = Math.floor(gameState.xpToNextLevel * 1.5);
    const bonus = gameState.level * 50;
    gameState.score += bonus;
    
    // CSS'indeki güzel modalı göster
    showLevelUpNotification(gameState.level, bonus);
    updateUI();
}

function showLevelUpNotification(level, bonus) {
    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    document.body.appendChild(overlay);
    
    // Notification (CSS'indeki .level-up-notification sınıfı)
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
        <div class="emoji">🎉</div>
        <h2>LEVEL ${level}!</h2>
        <p>Tebrikler! Seviye atladın.</p>
        <div class="bonus">+${bonus} Bonus Coin 💰</div>
    `;
    document.body.appendChild(notification);
    
    // Kapatma
    const closeNotify = () => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
            overlay.remove();
        }, 400);
    };

    setTimeout(closeNotify, 3000);
    overlay.onclick = closeNotify;
}

// --- DİĞER FONKSİYONLAR ---
function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    coinContainer.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function createParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 50 + Math.random() * 50;
        p.style.setProperty('--tx', `${Math.cos(angle) * velocity}px`);
        p.style.setProperty('--ty', `${Math.sin(angle) * velocity}px`);
        coinContainer.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }
}

function renderTasks() {
    const list = document.getElementById('task-list');
    if (!list) return;
    list.innerHTML = gameState.tasks.map(t => `
        <div class="item">
            <div class="item-info">
                <h3>${t.description} ${t.completed ? '✅' : ''}</h3>
                <p>${getTaskProgress(t)}</p>
            </div>
            <button style="background: ${t.completed ? '#444' : ''}; pointer-events: none;">${t.reward}</button>
        </div>
    `).join('');
}

function getTaskProgress(task) {
    if (task.completed) return 'Tamamlandı';
    if (task.id === 1) return `${gameState.clickCount} / ${task.target}`;
    if (task.id === 2) return `${Math.floor(gameState.score)} / ${task.target}`;
    if (task.id === 3) return `Level ${gameState.level} / ${task.target}`;
    return '';
}

function checkTasks() {
    gameState.tasks.forEach(t => {
        if (!t.completed) {
            let done = false;
            if (t.id === 1 && gameState.clickCount >= t.target) done = true;
            if (t.id === 2 && gameState.score >= t.target) done = true;
            if (t.id === 3 && gameState.level >= t.target) done = true;
            if (done) {
                t.completed = true;
                gameState.score += t.reward;
                showNotification(`✅ Görev Tamamlandı! +${t.reward} Coin`);
            }
        }
    });
}

function showNotification(msg) {
    const n = document.createElement('div');
    n.style.cssText = "position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(168,85,247,0.9);color:white;padding:12px 25px;border-radius:50px;z-index:9999;font-weight:bold;backdrop-filter:blur(5px);box-shadow:0 0 20px rgba(168,85,247,0.5);";
    n.innerText = msg;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 2000);
}

function saveGame() {
    localStorage.setItem('tapGameSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('tapGameSave');
    if (saved) {
        const loaded = JSON.parse(saved);
        // Enerji NaN kontrolü ve max enerji eşitleme
        if (isNaN(loaded.energy) || loaded.maxEnergy !== 1000) {
            loaded.energy = 1000;
            loaded.maxEnergy = 1000;
        }
        gameState = { ...gameState, ...loaded };
    }
}

function runAutoClickers() {
    if (gameState.autoClicker > 0) {
        gameState.score += gameState.autoClicker;
        updateUI();
    }
}

function claimDailyBonus() {
    const today = new Date().toDateString();
    if (gameState.lastDaily !== today) {
        gameState.score += 200;
        gameState.lastDaily = today;
        showNotification('🎁 Günlük Bonus Alındı! +200 💰');
        updateUI();
        saveGame();
    } else {
        showNotification('⏰ Yarın Tekrar Gel!');
    }
}

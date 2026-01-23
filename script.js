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
    energyRegenRate: 1, // Saniyede +1 enerji
    energyCostPerClick: 1, // Her tıklama -1 enerji
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
const gameMain = document.getElementById('game-main');
const coinContainer = document.getElementById('coin-container');
const energyFill = document.getElementById('energy-fill');
const energyText = document.getElementById('energy-text');

window.onload = () => {
    loadGame();
    updateUI();
    setInterval(runAutoClickers, 1000);
    setInterval(regenerateEnergy, 1000);
    setInterval(saveGame, 5000); // Her 5 saniyede bir kaydet
    animateScore();
};

// Smooth score animation
let displayScore = 0;
function animateScore() {
    if (displayScore < gameState.score) {
        displayScore += Math.ceil((gameState.score - displayScore) / 10);
        scoreEl.innerText = Math.floor(displayScore).toLocaleString();
    }
    requestAnimationFrame(animateScore);
}

coin.addEventListener('click', (e) => {
    // Enerji kontrolü - En az 1 enerji olmalı
    if (gameState.energy < gameState.energyCostPerClick) {
        showNotification('⚡ Enerji Yok! Bekle...', 'error');
        // Coin'i titret
        coin.style.animation = 'shake 0.5s';
        setTimeout(() => {
            coin.style.animation = 'float 3s ease-in-out infinite';
        }, 500);
        return;
    }
    
    let gain = gameState.clickPower;
    if (gameState.boosterActive) gain *= 2;
    
    gameState.score += gain;
    gameState.xp += Math.ceil(gain / 2);
    gameState.clickCount++;
    
    // Enerji azalt
    gameState.energy -= gameState.energyCostPerClick;
    if (gameState.energy < 0) gameState.energy = 0;

    // Level up check
    if (gameState.xp >= gameState.xpToNextLevel) {
        levelUp();
    }

    // Effects
    const rect = coinContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    createFloatingText(clickX, clickY, `+${gain}`);
    createParticles(clickX, clickY);
    
    // Coin bounce animation
    coin.style.animation = 'none';
    setTimeout(() => {
        coin.style.animation = 'float 3s ease-in-out infinite';
    }, 100);
    
    checkTasks();
    saveGame();
    updateUI();
});

// YENİ: Güzel Level Up Bildirimi
function levelUp() {
    const oldLevel = gameState.level;
    gameState.level++;
    gameState.xp = 0;
    gameState.xpToNextLevel = Math.floor(gameState.xpToNextLevel * 1.5);
    
    // Bonus reward
    const bonus = gameState.level * 50;
    gameState.score += bonus;
    
    // Confetti effect
    createConfetti();
    
    // Güzel bildirim göster
    showLevelUpNotification(gameState.level, bonus);
}

function showLevelUpNotification(level, bonus) {
    // Overlay oluştur
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    document.body.appendChild(overlay);
    
    // Bildirim oluştur
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
        <div class="emoji">🎉</div>
        <h2>LEVEL ${level}!</h2>
        <p>Tebrikler! Yeni seviyeye ulaştın</p>
        <div class="bonus">+${bonus} Bonus Coin 💰</div>
    `;
    
    document.body.appendChild(notification);
    
    // 3 saniye sonra kapat
    setTimeout(() => {
        notification.classList.add('hide');
        overlay.style.animation = 'fadeOut 0.3s ease';
        
        setTimeout(() => {
            notification.remove();
            overlay.remove();
        }, 400);
    }, 3000);
    
    // Tıklayınca kapat
    overlay.addEventListener('click', () => {
        notification.classList.add('hide');
        overlay.style.animation = 'fadeOut 0.3s ease';
        
        setTimeout(() => {
            notification.remove();
            overlay.remove();
        }, 400);
    });
}

function runAutoClickers() {
    if (gameState.autoClicker > 0) {
        let gain = gameState.autoClicker;
        if (gameState.boosterActive) gain *= 2;
        gameState.score += gain;
        updateUI();
        saveGame();
    }
}

// YENİ: Enerji yenileme sistemi
function regenerateEnergy() {
    if (gameState.energy < gameState.maxEnergy) {
        gameState.energy += gameState.energyRegenRate;
        if (gameState.energy > gameState.maxEnergy) {
            gameState.energy = gameState.maxEnergy;
        }
        updateUI();
    }
}

function updateUI() {
    // Score updates via animation function
    levelText.innerText = `Level ${gameState.level}`;
    xpText.innerText = `${gameState.xp} / ${gameState.xpToNextLevel} XP`;
    xpFill.style.width = `${(gameState.xp / gameState.xpToNextLevel) * 100}%`;
    
    // Enerji güncelle
    energyText.innerText = `${Math.floor(gameState.energy)} / ${gameState.maxEnergy}`;
    const energyPercent = (gameState.energy / gameState.maxEnergy) * 100;
    energyFill.style.width = `${energyPercent}%`;
    
    // Enerji rengini değiştir (az enerji = kırmızı)
    if (energyPercent < 20) {
        energyFill.style.background = 'linear-gradient(90deg, #ff3333 0%, #ff6666 100%)';
        energyFill.style.boxShadow = '0 0 20px rgba(255, 51, 51, 0.5)';
    } else if (energyPercent < 50) {
        energyFill.style.background = 'linear-gradient(90deg, #ffaa00 0%, #ffcc00 100%)';
        energyFill.style.boxShadow = '0 0 20px rgba(255, 170, 0, 0.5)';
    } else {
        energyFill.style.background = 'linear-gradient(90deg, #00ff88 0%, #00d9ff 100%)';
        energyFill.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';
    }
    
    // Update shop prices
    document.getElementById('click-inc-val').innerText = `+${gameState.clickPower}`;
    document.getElementById('auto-inc-val').innerText = gameState.autoClicker;
    document.getElementById('buy-click').innerText = 50 * gameState.clickPower;
    document.getElementById('buy-auto').innerText = 100 * (gameState.autoClicker + 1);
}

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
    const colors = ['#ffd700', '#ffed4e', '#fff', '#a855f7'];
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        coinContainer.appendChild(particle);
        setTimeout(() => particle.remove(), 600);
    }
}

function createConfetti() {
    const colors = ['#ffd700', '#a855f7', '#ec4899', '#fff', '#00ff88'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 0.3}s`;
            document.querySelector('.game-container').appendChild(confetti);
            setTimeout(() => confetti.remove(), 2000);
        }, i * 30);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #a855f7, #ec4899);
        color: white;
        padding: 15px 30px;
        border-radius: 15px;
        font-weight: bold;
        font-size: 1.2rem;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(168, 85, 247, 0.5);
        animation: slideDown 0.5s ease;
    `;
    notification.innerText = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

function showTab(type) {
    document.getElementById(type + '-modal').style.display = 'block';
    if (type === 'tasks') renderTasks();
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => {
        m.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            m.style.display = 'none';
            m.style.animation = 'fadeIn 0.3s ease';
        }, 300);
    });
}

function buyClickPower() {
    let cost = 50 * gameState.clickPower;
    if (gameState.score >= cost) {
        gameState.score -= cost;
        displayScore -= cost; // Görsel skoru da azalt
        gameState.clickPower++;
        showNotification('✨ Click Power Yükseltildi!', 'success');
        createConfetti();
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
        displayScore -= cost; // Görsel skoru da azalt
        gameState.autoClicker++;
        showNotification('🤖 Auto Clicker Satın Alındı!', 'success');
        createConfetti();
        updateUI();
        saveGame();
    } else {
        showNotification('❌ Yetersiz Coin!', 'error');
    }
}

function buyBooster() {
    if (gameState.score >= 500 && !gameState.boosterActive) {
        gameState.score -= 500;
        displayScore -= 500; // Görsel skoru da azalt
        gameState.boosterActive = true;
        showNotification('🚀 2x Booster Aktif! (30sn)', 'success');
        
        // Booster active visual effect
        coin.style.filter = 'drop-shadow(0 10px 50px rgba(255, 0, 255, 0.8)) brightness(1.5)';
        
        setTimeout(() => {
            gameState.boosterActive = false;
            coin.style.filter = 'drop-shadow(0 10px 30px rgba(255, 215, 0, 0.5))';
            showNotification('⏰ Booster Süresi Doldu', 'info');
        }, 30000);
        
        updateUI();
        saveGame();
    } else if (gameState.boosterActive) {
        showNotification('⏳ Booster Zaten Aktif!', 'info');
    } else {
        showNotification('❌ Yetersiz Coin!', 'error');
    }
}

function claimDailyBonus() {
    const today = new Date().toDateString();
    if (gameState.lastDaily !== today) {
        gameState.score += 200;
        gameState.lastDaily = today;
        showNotification('🎁 200 Günlük Bonus Alındı!', 'success');
        createConfetti();
        updateUI();
        saveGame();
    } else {
        showNotification('⏰ Yarın Tekrar Gel!', 'info');
    }
}

function checkTasks() {
    gameState.tasks.forEach(t => {
        if (!t.completed) {
            let completed = false;
            
            if (t.id === 1 && gameState.clickCount >= t.target) completed = true;
            if (t.id === 2 && gameState.score >= t.target) completed = true;
            if (t.id === 3 && gameState.level >= t.target) completed = true;
            
            if (completed) {
                t.completed = true;
                gameState.score += t.reward;
                showNotification(`✅ Görev Tamamlandı! +${t.reward} Coin`, 'success');
                createConfetti();
            }
        }
    });
}

function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = gameState.tasks.map(t => {
        const progress = getTaskProgress(t);
        const icon = t.completed ? '✅' : '⏳';
        
        return `
            <div class="item" style="opacity: ${t.completed ? 0.6 : 1}">
                <div class="item-info">
                    <h3>${icon} ${t.description}</h3>
                    <p>${progress}</p>
                </div>
                <b style="color: var(--primary); font-size: 1.2rem;">+${t.reward} 💰</b>
            </div>
        `;
    }).join('');
}

function getTaskProgress(task) {
    if (task.completed) return 'Tamamlandı!';
    
    if (task.id === 1) return `${gameState.clickCount} / ${task.target}`;
    if (task.id === 2) return `${Math.floor(gameState.score)} / ${task.target}`;
    if (task.id === 3) return `Level ${gameState.level} / ${task.target}`;
    
    return '';
}

function saveGame() {
    localStorage.setItem('tapGameSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('tapGameSave');
    if (saved) {
        const loadedState = JSON.parse(saved);
        // Eski kayıtlar için enerji ekleme
        if (typeof loadedState.energy === 'undefined') {
            loadedState.energy = 1000;
            loadedState.maxEnergy = 1000;
            loadedState.energyRegenRate = 1;
            loadedState.energyCostPerClick = 1;
        }
        gameState = loadedState;
        displayScore = gameState.score;
    }
    // İlk yüklemede kaydet
    saveGame();
}

// Add missing animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -100px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -100px); opacity: 0; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Oyun Verileri
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
    tasks: [
        { id: 1, description: "100 Tıklama Yap", target: 100, reward: 50, completed: false },
        { id: 2, description: "500 Coin Biriktir", target: 500, reward: 100, completed: false }
    ]
};

// DOM Elemanları
const scoreEl = document.getElementById('score');
const xpFill = document.getElementById('xp-fill');
const xpText = document.getElementById('xp-text');
const levelText = document.getElementById('level-text');
const coin = document.getElementById('main-coin');

// Sayfa yüklendiğinde verileri çek
window.onload = () => {
    loadGame();
    updateUI();
    setInterval(runAutoClickers, 1000); // Otomatik tıklayıcı
};

// --- ANA MEKANİK ---
coin.addEventListener('click', (e) => {
    let gain = gameState.clickPower;
    if (gameState.boosterActive) gain *= 2;
    
    addScore(gain);
    addXP(Math.ceil(gain / 2));
    
    gameState.clickCount++;
    checkTasks();
    
    // Görsel Efektler
    createFloatingText(e.clientX, e.clientY, `+${gain}`);
    animateCoin();
    saveGame();
});

function addScore(amount) {
    gameState.score += amount;
    updateUI();
}

function addXP(amount) {
    gameState.xp += amount;
    if (gameState.xp >= gameState.xpToNextLevel) {
        levelUp();
    }
    updateUI();
}

function levelUp() {
    gameState.level++;
    gameState.xp = 0;
    gameState.xpToNextLevel = Math.floor(gameState.xpToNextLevel * 1.5);
    alert(`Tebrikler! Level ${gameState.level} oldun!`);
}

// --- MARKET SİSTEMİ ---
function buyClickPower() {
    let cost = 50 * gameState.clickPower;
    if (gameState.score >= cost) {
        gameState.score -= cost;
        gameState.clickPower++;
        closeModal();
        saveGame();
        updateUI();
    }
}

function buyAutoClicker() {
    let cost = 100 * (gameState.autoClicker + 1);
    if (gameState.score >= cost) {
        gameState.score -= cost;
        gameState.autoClicker++;
        closeModal();
        saveGame();
        updateUI();
    }
}

function runAutoClickers() {
    if (gameState.autoClicker > 0) {
        let gain = gameState.autoClicker;
        if (gameState.boosterActive) gain *= 2;
        addScore(gain);
        addXP(1);
    }
}

function buyBooster() {
    if (gameState.score >= 500 && !gameState.boosterActive) {
        gameState.score -= 500;
        gameState.boosterActive = true;
        setTimeout(() => {
            gameState.boosterActive = false;
            updateUI();
        }, 30000);
        closeModal();
        updateUI();
    }
}

// --- GÖREVLER VE BONUS ---
function claimDailyBonus() {
    const now = new Date().toDateString();
    if (gameState.lastDaily !== now) {
        gameState.score += 200;
        gameState.lastDaily = now;
        alert("Günlük 200 Coin ödülünü aldın!");
        saveGame();
        updateUI();
    } else {
        alert("Bugünkü ödülü zaten aldın!");
    }
}

function checkTasks() {
    gameState.tasks.forEach(task => {
        if (!task.completed) {
            if (task.id === 1 && gameState.clickCount >= task.target) {
                completeTask(task);
            }
            if (task.id === 2 && gameState.score >= task.target) {
                completeTask(task);
            }
        }
    });
}

function completeTask(task) {
    task.completed = true;
    gameState.score += task.reward;
    alert(`Görev Tamamlandı: ${task.description}\nÖdül: ${task.reward} Coin`);
}

// --- UI VE YARDIMCI FONKSİYONLAR ---
function updateUI() {
    scoreEl.innerText = Math.floor(gameState.score);
    levelText.innerText = `Level ${gameState.level}`;
    xpText.innerText = `${gameState.xp} / ${gameState.xpToNextLevel} XP`;
    
    const progress = (gameState.xp / gameState.xpToNextLevel) * 100;
    xpFill.style.width = `${progress}%`;

    document.getElementById('buy-click').innerText = `Maliyet: ${50 * gameState.clickPower}`;
    document.getElementById('buy-auto').innerText = `Maliyet: ${100 * (gameState.autoClicker + 1)}`;
}

function animateCoin() {
    coin.style.transform = "scale(1.1)";
    setTimeout(() => coin.style.transform = "scale(1)", 100);
}

function createFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

// Sekme/Modal Yönetimi
function showTab(type) {
    if (type === 'shop') document.getElementById('shop-modal').style.display = 'block';
    if (type === 'tasks') {
        renderTasks();
        document.getElementById('tasks-modal').style.display = 'block';
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function renderTasks() {
    const container = document.getElementById('task-list');
    container.innerHTML = gameState.tasks.map(t => `
        <div class="item" style="opacity: ${t.completed ? 0.5 : 1}">
            <div>
                <h3>${t.description}</h3>
                <small>${t.completed ? 'Tamamlandı' : 'Devam ediyor'}</small>
            </div>
            <span>${t.reward} 🪙</span>
        </div>
    `).join('');
}

// Kayıt Sistemi
function saveGame() {
    localStorage.setItem('clickerGameState', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('clickerGameState');
    if (saved) gameState = JSON.parse(saved);
}

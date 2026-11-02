let currentLang = 'ja';
let coins = 300;
let gems = 10;
let fullness = 40;
let level = 1;
let exp = 0;
const expPerLevel = 100;
let selectedCharKey = 'mogu';

let currentShopCategory = 'veg';
let inventory = { apple: 1, milk: 1, carrot: 1 };

// Mini Game Variables
let gameInterval = null;
let itemSpawnerTimer = null;
let gameTimerSeconds = 30;
let gameScore = 0;
let playerXPos = 50;
let targetXPos = 50;
let playerMoveSpeed = 3.5;
let playerScale = 1.0; // Mini game အတွင်း character အရွယ်အစား ကြီး/သေး ပြောင်းရန် variable
let moveDirection = 0;
let activeFallingItems = [];
let isGameRunning = false;
let pendingNavButton = null;

function showNotification(message, type = 'toast-success') {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
}

function playPopSound(freq = 400) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq + 400, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
        setTimeout(() => audioCtx.close(), 250);
    } catch (e) { }
}

function getStageMediaPath(avatarPath) {
    if (!avatarPath) return 'img/moguidle.webm';
    const path = String(avatarPath);
    const file = path.split('/').pop();
    const stem = file.replace(/\.(png|jpe?g|webp|gif)$/i, '');
    return `img/${stem}.webm`;
}

function setVideoSource(video, avatarPath, fallbackImage = 'img/moguidle.png') {
    if (!video) return;
    const webmPath = getStageMediaPath(avatarPath);
    video.onerror = () => {
        video.onerror = null;
        const img = document.createElement('img');
        img.id = video.id;
        img.className = video.className;
        img.alt = video.getAttribute('aria-label') || 'Pet';
        img.src = avatarPath || fallbackImage;
        if (video.style.cssText) img.style.cssText = video.style.cssText;
        video.replaceWith(img);
    };
    video.src = webmPath;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.load();
    const playPromise = video.play();
    if (playPromise && playPromise.catch) playPromise.catch(() => { });
}

function interactCharacter() {
    const charAvatar = document.getElementById('charAvatarImg');
    if (!charAvatar) return;
    charAvatar.classList.remove('jump-anim');
    void charAvatar.offsetWidth;
    charAvatar.classList.add('jump-anim');
    playPopSound(600);
    setTimeout(() => charAvatar.classList.remove('jump-anim'), 400);
}

function getMediaHTML(food, customStyle = 'width: 45px; height: 45px; object-fit: contain;') {
    if (food.emoji && food.emoji.includes('/')) {
        return `<img src="${food.emoji}" style="${customStyle}" alt="">`;
    }
    return `<div style="font-size: 36px;">${food.emoji || '🍎'}</div>`;
}

function chooseInitialLanguage(lang) {
    currentLang = lang;
    changeLanguage(lang);
    document.getElementById('langScreen').classList.add('hidden');
    document.getElementById('selectScreen').classList.remove('hidden');
}

function changeLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key];
        }
    });
    renderCharacterSelect();
    renderShop();
    renderMyPageGuides();
    if (selectedCharKey) updateUI();
}

function renderCharacterSelect() {
    const container = document.getElementById('charSelectContainer');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(charactersData).forEach(key => {
        const char = charactersData[key];
        const avatar = char.stages[0].avatar;
        container.innerHTML += `
            <div class="char-card" onclick="selectCharacter('${key}')">
                <div class="char-img"><img src="${avatar}" alt="${char.name[currentLang]}"></div>
                <h3>${char.name[currentLang]}</h3>
                <span class="char-sub">${char.desc[currentLang]}</span>
            </div>`;
    });
}

function selectCharacter(key) {
    selectedCharKey = key;
    playPopSound(800);
    document.getElementById('selectScreen').classList.add('hidden');
    document.getElementById('mainScreen').classList.remove('hidden');
    document.getElementById('bottomNav').classList.remove('hidden');
    document.getElementById('headerBar').classList.remove('hidden');
    updateUI();
}

function switchTab(screenId, btnElement) {
    playPopSound(500);
    if (isGameRunning) stopCatchGameLoop();
    ['mainScreen', 'catchGameScreen', 'shopScreen', 'mypageScreen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) targetScreen.classList.remove('hidden');
    if (btnElement) {
        document.querySelectorAll('.game-nav-item').forEach(item => item.classList.remove('active'));
        btnElement.classList.add('active');
    }
    if (screenId === 'shopScreen') renderShop();
    if (screenId === 'mypageScreen') {
        updateUI();
        renderMyPageGuides();
    }
}

function openGameEntryModal(btnElement) {
    playPopSound(500);
    pendingNavButton = btnElement;
    document.getElementById('gameEntryModal').classList.add('show');
}
function closeGameEntryModal() {
    playPopSound(300);
    document.getElementById('gameEntryModal').classList.remove('show');
    pendingNavButton = null;
}
function confirmAndStartCatchGame() {
    closeGameEntryModal();
    if (coins < 100) {
        playPopSound(200);
        showNotification(translations[currentLang].msgNotEnoughCoinGame, 'toast-error');
        return;
    }
    coins -= 100;
    updateUI();
    playPopSound(700);
    if (pendingNavButton) {
        document.querySelectorAll('.game-nav-item').forEach(item => item.classList.remove('active'));
        pendingNavButton.classList.add('active');
    }
    ['mainScreen', 'catchGameScreen', 'shopScreen', 'mypageScreen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    document.getElementById('catchGameScreen').classList.remove('hidden');
    startCatchGameEngine();
}

function startCatchGameEngine() {
    isGameRunning = true;
    gameScore = 0;
    gameTimerSeconds = 30;
    playerMoveSpeed = 3.5;
    playerScale = 1.0; // ဂိမ်းစတင်ချိန်တွင် အရွယ်အစား မူလအတိုင်းထားမည်
    updatePlayerScale();

    playerXPos = targetXPos = 50;
    moveDirection = 0;
    activeFallingItems.forEach(it => it.element.remove());
    activeFallingItems = [];

    const charInfo = charactersData[selectedCharKey];
    const currentStage = charInfo.stages[level >= 3 ? 2 : (level === 2 ? 1 : 0)];
    const gameAvatar = document.getElementById('gamePlayerAvatar');
    if (gameAvatar && gameAvatar.tagName === 'VIDEO') {
        setVideoSource(gameAvatar, currentStage.avatar);
    } else if (gameAvatar) {
        gameAvatar.src = currentStage.avatar;
    }

    document.getElementById('gameScoreText').innerText = `スコア: ${gameScore}`;
    document.getElementById('gameTimerText').innerText = `${gameTimerSeconds}秒`;

    clearInterval(gameInterval);
    clearInterval(itemSpawnerTimer);
    gameInterval = setInterval(() => {
        gameTimerSeconds--;
        document.getElementById('gameTimerText').innerText = `${gameTimerSeconds}秒`;
        if (gameTimerSeconds <= 0) endCatchGame();
    }, 1000);
    itemSpawnerTimer = setInterval(spawnFallingItem, 400);
    requestAnimationFrame(updateGameLoop);
    setupSmoothControls();
}

// Mogu-chan ၏ Mini game အတွင်း scale အတိုးအလျော့ကို ထိန်းချုပ်ပေးသော function
function updatePlayerScale() {
    const basket = document.getElementById('playerBasket');
    if (basket) {
        basket.style.transform = `translateX(-50%) scale(${playerScale})`;
    }
}

function setupSmoothControls() {
    const canvasArea = document.getElementById('gameCanvasArea');
    if (!canvasArea) return;
    const updateTargetFromClientX = clientX => {
        if (!isGameRunning) return;
        const rect = canvasArea.getBoundingClientRect();
        let percent = ((clientX - rect.left) / rect.width) * 100;
        targetXPos = Math.max(5, Math.min(95, percent));
    };
    canvasArea.onmousemove = e => updateTargetFromClientX(e.clientX);
    canvasArea.ontouchmove = e => {
        if (e.touches.length > 0) updateTargetFromClientX(e.touches[0].clientX);
    };
    canvasArea.ontouchstart = e => {
        if (e.touches.length > 0) updateTargetFromClientX(e.touches[0].clientX);
    };
}

function startMoving(dir) { moveDirection = dir; }
function stopMoving() { moveDirection = 0; }

function spawnFallingItem() {
    if (!isGameRunning) return;
    const canvasArea = document.getElementById('gameCanvasArea');
    if (!canvasArea) return;
    const foodKeys = Object.keys(foodsData);
    const food = foodsData[foodKeys[Math.floor(Math.random() * foodKeys.length)]];
    const el = document.createElement('div');
    el.className = 'falling-item';
    el.innerText = food.emoji;
    const startX = Math.random() * 85 + 5;
    el.style.left = startX + '%';
    el.style.top = '-40px';
    canvasArea.appendChild(el);
    activeFallingItems.push({
        element: el, x: startX, y: -40,
        speed: Math.random() * 1.5 + 2.2,
        isJunk: food.isJunk, emoji: food.emoji
    });
}

function updateGameLoop() {
    if (!isGameRunning) return;
    const canvasArea = document.getElementById('gameCanvasArea');
    const basket = document.getElementById('playerBasket');
    if (!canvasArea || !basket) return;

    if (moveDirection !== 0) {
        targetXPos = Math.max(5, Math.min(95, targetXPos + moveDirection * playerMoveSpeed * 2.5));
    }
    playerXPos += (targetXPos - playerXPos) * 0.25;
    basket.style.left = playerXPos + '%';

    const canvasHeight = canvasArea.clientHeight;
    for (let i = activeFallingItems.length - 1; i >= 0; i--) {
        const item = activeFallingItems[i];
        item.y += item.speed;
        item.element.style.top = item.y + 'px';
        if (item.y >= canvasHeight - 110 && item.y <= canvasHeight - 40 &&
            Math.abs(item.x - playerXPos) < 14) {
            playPopSound(item.isJunk ? 200 : 900);
            showFloatingEffect(item.x, item.y, item.isJunk ? '-5 🛑' : '+10 ✨',
                item.isJunk ? '#f43f5e' : '#22c55e');

            if (item.isJunk) {
                playerMoveSpeed = Math.max(0.4, playerMoveSpeed - 0.8);
                playerScale = Math.max(0.5, playerScale - 0.2); // Junk food စားမိလျှင် ပိုသေးသွားမည်
                gameScore = Math.max(0, gameScore - 5);
            } else {
                // Healthy food စားမိလျှင် အများကြီး ပိုကြီးလာမည် (scale ကို 0.35 စီတိုးပြီး အများဆုံး 2.5 ထိ ကြီးနိုင်သည်)
                playerScale = Math.min(2.5, playerScale + 0.35);
                gameScore += 10;
            }

            updatePlayerScale(); // အရွယ်အစားပြောင်းလဲမှုကို Screen ပေါ်တွင် ပုံဖော်ပေးမည်

            document.getElementById('gameScoreText').innerText = `スコア: ${gameScore}`;
            item.element.remove();
            activeFallingItems.splice(i, 1);
            continue;
        }
        if (item.y > canvasHeight) {
            item.element.remove();
            activeFallingItems.splice(i, 1);
        }
    }
    if (isGameRunning) requestAnimationFrame(updateGameLoop);
}

function showFloatingEffect(xPercent, yPos, text, colorHex) {
    const canvasArea = document.getElementById('gameCanvasArea');
    if (!canvasArea) return;
    const fx = document.createElement('div');
    fx.className = 'floating-effect';
    fx.innerText = text;
    fx.style.left = xPercent + '%';
    fx.style.top = yPos + 'px';
    fx.style.color = colorHex;
    canvasArea.appendChild(fx);
    setTimeout(() => fx.remove(), 600);
}

function stopCatchGameLoop() {
    isGameRunning = false;
    clearInterval(gameInterval);
    clearInterval(itemSpawnerTimer);
    activeFallingItems.forEach(it => it.element.remove());
    activeFallingItems = [];
}
function exitCatchGame() {
    stopCatchGameLoop();
    switchTab('mainScreen', document.querySelectorAll('.game-nav-item')[0]);
}
function endCatchGame() {
    stopCatchGameLoop();
    const earnedGems = Math.floor(gameScore / 30) + 1;
    gems += earnedGems;
    document.getElementById('modalScoreTitle').innerText = `スコア: ${gameScore}`;
    document.getElementById('modalRewardDesc').innerText = `💎 +${earnedGems} Diamond ရရှိပါပြီ!`;
    document.getElementById('gameResultModal').classList.add('show');
    updateUI();
}
function closeGameResultModal() {
    document.getElementById('gameResultModal').classList.remove('show');
    switchTab('mainScreen', document.querySelectorAll('.game-nav-item')[0]);
}

function switchShopCategory(catKey, btnElem) {
    playPopSound(500);
    currentShopCategory = catKey;
    document.querySelectorAll('.shop-cat-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElem) btnElem.classList.add('active');
    renderShop();
}
function renderShop() {
    const container = document.getElementById('shopContainer');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(foodsData).forEach(key => {
        const food = foodsData[key];
        if (food.category !== currentShopCategory) return;
        const isLocked = level < food.reqLevel;
        const mediaHTML = getMediaHTML(food);
        const btnHTML = isLocked
            ? `<button class="game-btn btn-warning" style="opacity:0.5;" disabled>🔒 Lv.${food.reqLevel}</button>`
            : `<button class="game-btn btn-primary" onclick="buyFood('${key}')"><img src="img/coin.png" class="hud-stat-img" alt="Coin"> ${food.price}</button>`;
        container.innerHTML += `
            <div class="shop-item ${isLocked ? 'locked' : ''}">
                ${mediaHTML}
                <div class="food-title">${food.name[currentLang]}</div>
                <div class="food-desc">+${food.fullness} Full</div>
                ${btnHTML}
            </div>`;
    });
}
function buyFood(foodKey) {
    const food = foodsData[foodKey];
    if (coins >= food.price) {
        coins -= food.price;
        inventory[foodKey] = (inventory[foodKey] || 0) + 1;
        playPopSound(900);
        showNotification(translations[currentLang].msgBuy, 'toast-success');
        updateUI();
    } else {
        playPopSound(200);
        showNotification(translations[currentLang].msgNoCoin, 'toast-error');
    }
}
function feedFood(foodKey) {
    if ((inventory[foodKey] || 0) > 0) {
        inventory[foodKey]--;
        const food = foodsData[foodKey];
        fullness = Math.min(100, fullness + food.fullness);
        exp += food.exp;
        playPopSound(700);
        if (exp >= expPerLevel) {
            level++;
            exp -= expPerLevel;
            showNotification(translations[currentLang].msgLevelUp, 'toast-warning');
        } else showNotification(translations[currentLang].msgFeed, 'toast-success');
        updateUI();
    }
}
function renderMyPageGuides() {
    const container = document.getElementById('guideContainer');
    if (!container) return;
    container.innerHTML = '';
    container.className = 'shelf-container';
    Object.keys(foodsData).forEach(key => {
        const food = foodsData[key];
        const mediaHTML = getMediaHTML(food, 'width: 32px; height: 32px; object-fit: contain;');
        container.innerHTML += `
            <div class="shelf-item" onclick="showFoodModal('${key}')">${mediaHTML}</div>`;
    });
}
function showFoodModal(foodKey) {
    const food = foodsData[key];
    const modalMediaContainer = document.getElementById('modalEmoji');
    if (!modalMediaContainer) return;
    if (food.emoji && food.emoji.includes('/')) {
        modalMediaContainer.innerHTML = `<img src="${food.emoji}" style="width:80px;height:80px;object-fit:contain;" alt="">`;
    } else modalMediaContainer.innerText = food.emoji;
    document.getElementById('modalName').innerText = food.name[currentLang];
    document.getElementById('modalDesc').innerText = food.desc[currentLang];
    document.getElementById('foodInfoModal').classList.add('show');
}
function closeFoodModal() {
    const modal = document.getElementById('foodInfoModal');
    if (modal) modal.classList.remove('show');
}
function closeFoodModalOnOutside(event) {
    const modalCard = document.querySelector('#foodInfoModal .game-modal-card');
    if (modalCard && !modalCard.contains(event.target)) closeFoodModal();
}

function updateAvatarElement(elementId, avatarPath) {
    const element = document.getElementById(elementId);
    if (!element) return;
    if (element.tagName === 'VIDEO') {
        setVideoSource(element, avatarPath);
    } else {
        element.src = avatarPath;
    }
}

function updateUI() {
    const charInfo = charactersData[selectedCharKey];
    if (!charInfo) return;
    const currentStage = charInfo.stages[level >= 3 ? 2 : (level === 2 ? 1 : 0)];

    const coinEl = document.getElementById('coinCount');
    if (coinEl) coinEl.innerText = coins;
    const gemEl = document.getElementById('gemCount');
    if (gemEl) gemEl.innerText = gems;

    const nameEl = document.getElementById('charNameDisplay');
    if (nameEl) nameEl.innerText = charInfo.name[currentLang];
    const levelEl = document.getElementById('charLevel');
    if (levelEl) levelEl.innerText = level;
    const stageTitle = document.getElementById('charStageTitle');
    if (stageTitle) stageTitle.innerText = currentStage.title[currentLang];

    updateAvatarElement('charAvatarImg', currentStage.avatar);
    updateAvatarElement('myPageAvatarImg', currentStage.avatar);
    updateAvatarElement('navMyPageImg', currentStage.avatar);

    const myPageName = document.getElementById('myPageCharName');
    if (myPageName) myPageName.innerText = charInfo.name[currentLang];

    const fullnessBar = document.getElementById('fullnessBar');
    if (fullnessBar) fullnessBar.style.width = fullness + '%';
    const fullnessText = document.getElementById('fullnessText');
    if (fullnessText) fullnessText.innerText = fullness + '%';
    const expBar = document.getElementById('expBar');
    if (expBar) expBar.style.width = (exp / expPerLevel * 100) + '%';
    const expText = document.getElementById('expText');
    if (expText) expText.innerText = `${exp} / ${expPerLevel}`;

    const invContainer = document.getElementById('inventoryContainer');
    if (invContainer) {
        invContainer.innerHTML = '';
        Object.keys(foodsData).forEach(key => {
            const food = foodsData[key];
            const count = inventory[key] || 0;
            if (count > 0) {
                invContainer.innerHTML += `
                    <div class="inv-card">
                        <span class="inv-count">${count}</span>
                        ${getMediaHTML(food)}
                        <div style="font-size:11px;font-weight:800;margin-bottom:4px;">${food.name[currentLang]}</div>
                        <button class="game-btn btn-primary" style="padding:6px;font-size:12px;" onclick="feedFood('${key}')">${translations[currentLang].btnFeed}</button>
                    </div>`;
            }
        });
    }

    const evoContainer = document.getElementById('evolutionChain');
    if (evoContainer) {
        evoContainer.innerHTML = '';
        charInfo.stages.forEach(st => {
            const isCurrent = level >= st.level;
            evoContainer.innerHTML += `
                <div class="evo-step ${isCurrent ? 'active' : ''}">
                    <div class="evo-emoji"><img src="${st.avatar}" alt=""></div>
                    <div>Lv.${st.level}</div>
                </div>`;
        });
    }
}

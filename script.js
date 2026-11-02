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

// Mini Catch Game Variables
let gameInterval = null;
let itemSpawnerTimer = null;
let gameTimerSeconds = 30;
let gameScore = 0;
let playerXPos = 50;
let targetXPos = 50;
let playerMoveSpeed = 3.5;
let playerScale = 1.0;
let moveDirection = 0;
let activeFallingItems = [];
let isGameRunning = false;
let animationFrameId = null;

// Quiz Variables
let quizQuestions = [
    {
        emoji: "🥕",
        question: { ja: "にんじんは なにに いいかな？", my: "မုန်လာဥနီက ဘာအတွက် ကောင်းတာလဲ။" },
        correct: { ja: "目 (め)", my: "မျက်စိ" },
        decoys: [
            { ja: "骨 (ほね)", my: "အရိုး" },
            { ja: "心臓 (しんぞう)", my: "နှလုံး" }
        ],
        explain: { ja: "にんじんには 目を よくする えいようが あるよ！", my: "မုန်လာဥနီမှာ မျက်စိအားကောင်းစေတဲ့ အာဟာရ ပါပါတယ်!" }
    },
    {
        emoji: "🥛",
        question: { ja: "ぎゅうにゅうは なにを つ強くする？", my: "နွားနို့က ဘာကို သန်မာစေတာလဲ။" },
        correct: { ja: "骨 (ほね)", my: "အရိုး" },
        decoys: [
            { ja: "髪の毛 (かみのけ)", my: "ဆံပင်" },
            { ja: "爪 (つめ)", my: "လက်သည်း" }
        ],
        explain: { ja: "ぎゅうにゅうの カルシウムは ほねを つよくするよ！", my: "နွားနို့မှာ ပါတဲ့ ကယ်လ်ဆီယမ်က အရိုးတွေကို သန်မာစေပါတယ်!" }
    },
    {
        emoji: "🐟",
        question: { ja: "さかなは どこに いいかな？", my: "ငါးစားရင် ဘာအတွက် ကောင်းတာလဲ။" },
        correct: { ja: "頭 (あたま)", my: "ဦးနှောက်" },
        decoys: [
            { ja: "おなか", my: "ဝမ်းဗိုက်" },
            { ja: "足 (あし)", my: "ခြေထောက်" }
        ],
        explain: { ja: "さかなには あたまを よくする えいようが あるよ！", my: "ငါးမှာ ဦးနှောက် ဖွံ့ဖြိုးစေတဲ့ အာဟာရဓာတ် ပါပါတယ်!" }
    },
    {
        emoji: "🥦",
        question: { ja: "ブロッコリーは なにを するかな？", my: "ပန်းပွင့်စိမ်းက ဘာလုပ်ပေးတာလဲ။" },
        correct: { ja: "からだを まもる", my: "ခုခံအား တိုးစေတယ်" },
        decoys: [
            { ja: "ねむくなる", my: "အိပ်ချင်စေတယ်" },
            { ja: "ふとる", my: "ဝစေတယ်" }
        ],
        explain: { ja: "ブロッコリーは ビタミンで からだを まもるよ！", my: "ပန်းပွင့်စိမ်းမှာ ပါတဲ့ ဗီတာမင်က ခန္ဓာကိုယ် ကိုယ်ခံအား တိုးစေပါတယ်!" }
    },
    {
        emoji: "🍩",
        question: { ja: "ドーナツを たべすぎると どうなる？", my: "ဒိုးနတ် အများကြီးစားရင် ဘာဖြစ်မလဲ။" },
        correct: { ja: "むしばに なりやすい", my: "သွားဆွေးလွယ်တယ်" },
        decoys: [
            { ja: "背が たかくなる", my: "အရပ်ရှည်လာမယ်" },
            { ja: "目が よく trailhead", my: "မျက်စိ အားကောင်းမယ်" }
        ],
        explain: { ja: "ドーナツは さとうが おおいから たべすぎに ちゅうい！", my: "ဒိုးနတ်မှာ သကြားဓာတ် များလို့ အများကြီး မစားသင့်ပါဘူး!" }
    }
];

let currentQuizIndex = 0;
let quizScore = 0;
let isQuizActive = false;
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
    } catch (e) {}
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
    if (playPromise && playPromise.catch) playPromise.catch(() => {});
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
    ['mainScreen', 'catchGameScreen', 'quizScreen', 'shopScreen', 'mypageScreen'].forEach(id => {
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

// Quiz Modal Logic
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

function confirmAndStartQuiz() {
    closeGameEntryModal();
    playPopSound(700);

    if (pendingNavButton) {
        document.querySelectorAll('.game-nav-item').forEach(item => item.classList.remove('active'));
        pendingNavButton.classList.add('active');
    }

    ['mainScreen', 'catchGameScreen', 'quizScreen', 'shopScreen', 'mypageScreen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    document.getElementById('quizScreen').classList.remove('hidden');

    startQuizGame();
}

// Mini Game Modal Logic
function openMiniGameModal(btnElement) {
    playPopSound(500);
    pendingNavButton = btnElement;
    document.getElementById('miniGameEntryModal').classList.add('show');
}

function closeMiniGameEntryModal() {
    playPopSound(300);
    document.getElementById('miniGameEntryModal').classList.remove('show');
    pendingNavButton = null;
}

function confirmAndStartCatchGame() {
    closeMiniGameEntryModal();

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

    ['mainScreen', 'catchGameScreen', 'quizScreen', 'shopScreen', 'mypageScreen'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    document.getElementById('catchGameScreen').classList.remove('hidden');

    startCatchGameEngine();
}

// --- QUIZ ENGINE ---
function startQuizGame() {
    isQuizActive = true;
    currentQuizIndex = 0;
    quizScore = 0;
    quizQuestions.sort(() => Math.random() - 0.5);
    loadQuizQuestion();
}

function loadQuizQuestion() {
    if (currentQuizIndex >= quizQuestions.length) {
        endQuizGame();
        return;
    }

    const q = quizQuestions[currentQuizIndex];
    document.getElementById('quizProgressText').innerText = `${currentQuizIndex + 1} / ${quizQuestions.length}`;
    document.getElementById('quizImageContainer').innerText = q.emoji;
    document.getElementById('quizQuestionText').innerText = q.question[currentLang];

    let options = [
        { text: q.correct[currentLang], isCorrect: true },
        { text: q.decoys[0][currentLang], isCorrect: false },
        { text: q.decoys[1][currentLang], isCorrect: false }
    ];
    options.sort(() => Math.random() - 0.5);

    const optionsContainer = document.getElementById('quizOptionsContainer');
    optionsContainer.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'game-btn btn-secondary';
        btn.style.margin = '4px 0';
        btn.innerText = opt.text;
        btn.onclick = () => handleQuizAnswer(opt.isCorrect, q);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('quizExplanationBox').classList.add('hidden');
}

function handleQuizAnswer(isCorrect, q) {
    const optionsContainer = document.getElementById('quizOptionsContainer');
    const buttons = optionsContainer.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);

    const expBox = document.getElementById('quizExplanationBox');
    const resTitle = document.getElementById('quizResultTitle');
    const expText = document.getElementById('quizExplanationText');

    if (isCorrect) {
        playPopSound(900);
        quizScore++;
        expBox.classList.add('hidden');
        setTimeout(() => {
            if (isQuizActive) nextQuizQuestion();
        }, 500);
    } else {
        playPopSound(200);
        expBox.classList.remove('hidden');
        resTitle.innerText = currentLang === 'ja' ? `❌ ざんねん！ (せいかい: ${q.correct[currentLang]})` : `❌ အဖြေမှားပါသည်! (အဖြေမှန်: ${q.correct[currentLang]})`;
        resTitle.style.color = "#be123c";
        expText.innerText = q.explain[currentLang];
    }
}

function nextQuizQuestion() {
    currentQuizIndex++;
    loadQuizQuestion();
}

function endQuizGame() {
    isQuizActive = false;
    let earnedCoins = 50;
    coins += earnedCoins;
    updateUI();

    document.getElementById('modalResultBadge').innerText = "🎉 Quiz クリア！";
    document.getElementById('modalScoreTitle').innerText = `スコア: ${quizScore} / ${quizQuestions.length}`;
    document.getElementById('modalRewardDesc').innerText = currentLang === 'ja' ? `🪙 +${earnedCoins} コインを もらったよ！` : `🪙 +${earnedCoins} Coin ရရှိပါပြီ!`;
    document.getElementById('gameResultModal').classList.add('show');
}

// --- MINI CATCH GAME ENGINE ---
function startCatchGameEngine() {
    stopCatchGameLoop();
    isGameRunning = true;
    gameScore = 0;
    gameTimerSeconds = 30;
    playerMoveSpeed = 3.5;
    playerScale = 1.0;
    playerXPos = 50;
    targetXPos = 50;
    moveDirection = 0;

    const canvasArea = document.getElementById('gameCanvasArea');
    if (canvasArea) {
        const oldItems = canvasArea.querySelectorAll('.falling-item');
        oldItems.forEach(el => el.remove());
    }
    activeFallingItems = [];

    const charInfo = charactersData[selectedCharKey];
    const currentStage = charInfo.stages[level >= 3 ? 2 : (level === 2 ? 1 : 0)];
    const gameAvatar = document.getElementById('gamePlayerAvatar');
    if (gameAvatar && gameAvatar.tagName === 'VIDEO') {
        setVideoSource(gameAvatar, currentStage.avatar);
    } else if (gameAvatar) {
        gameAvatar.src = currentStage.avatar;
    }

    updatePlayerScale();
    document.getElementById('gameScoreText').innerText = `スコア: ${gameScore}`;
    document.getElementById('gameTimerText').innerText = `${gameTimerSeconds}秒`;

    gameInterval = setInterval(() => {
        gameTimerSeconds--;
        document.getElementById('gameTimerText').innerText = `${gameTimerSeconds}秒`;
        if (gameTimerSeconds <= 0) endCatchGame();
    }, 1000);

    itemSpawnerTimer = setInterval(spawnFallingItem, 400);
    animationFrameId = requestAnimationFrame(updateGameLoop);
    setupSmoothControls();
}

function updatePlayerScale() {
    const basket = document.getElementById('playerBasket');
    if (basket) {
        basket.style.left = playerXPos + '%';
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
        element: el,
        x: startX,
        y: -40,
        speed: Math.random() * 1.5 + 2.5,
        isJunk: food.isJunk,
        emoji: food.emoji
    });
}

function updateGameLoop() {
    if (!isGameRunning) return;

    const canvasArea = document.getElementById('gameCanvasArea');
    if (!canvasArea) return;

    if (moveDirection !== 0) {
        targetXPos = Math.max(5, Math.min(95, targetXPos + moveDirection * playerMoveSpeed * 1.2));
    }

    playerXPos += (targetXPos - playerXPos) * 0.25;
    updatePlayerScale();

    const canvasHeight = canvasArea.clientHeight || 350;

    for (let i = activeFallingItems.length - 1; i >= 0; i--) {
        const item = activeFallingItems[i];
        item.y += item.speed;
        item.element.style.top = item.y + 'px';

        if (item.y >= canvasHeight - 100 && item.y <= canvasHeight - 30) {
            if (Math.abs(item.x - playerXPos) < (15 * playerScale)) {
                playPopSound(item.isJunk ? 200 : 900);
                
                if (item.isJunk) {
                    playerMoveSpeed = Math.max(0.5, playerMoveSpeed - 0.5);
                    playerScale = Math.max(0.5, playerScale - 0.2);
                    gameScore = Math.max(0, gameScore - 5);
                } else {
                    playerScale = Math.min(2.5, playerScale + 0.35);
                    gameScore += 10;
                }
                
                document.getElementById('gameScoreText').innerText = `スコア: ${gameScore}`;
                item.element.remove();
                activeFallingItems.splice(i, 1);
                continue;
            }
        }

        if (item.y > canvasHeight) {
            item.element.remove();
            activeFallingItems.splice(i, 1);
        }
    }

    if (isGameRunning) {
        animationFrameId = requestAnimationFrame(updateGameLoop);
    }
}

function stopCatchGameLoop() {
    isGameRunning = false;
    if (gameInterval) clearInterval(gameInterval);
    if (itemSpawnerTimer) clearInterval(itemSpawnerTimer);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    activeFallingItems.forEach(it => {
        if (it.element) it.element.remove();
    });
    activeFallingItems = [];
}

function exitCatchGame() {
    stopCatchGameLoop();
    switchTab('mainScreen', document.querySelectorAll('.game-nav-item')[0]);
}

function endCatchGame() {
    stopCatchGameLoop();
    let earnedGems = Math.floor(gameScore / 30) + 1;
    gems += earnedGems;
    updateUI();

    document.getElementById('modalResultBadge').innerText = "🎉 ゲーム クリア！";
    document.getElementById('modalScoreTitle').innerText = `スコア: ${gameScore}`;
    document.getElementById('modalRewardDesc').innerText = currentLang === 'ja' ? `💎 +${earnedGems} ダイヤを もらったよ！` : `💎 +${earnedGems} Diamond ရရှိပါပြီ!`;
    document.getElementById('gameResultModal').classList.add('show');
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
    const food = foodsData[foodKey];
    if (!food) return;

    const modalMediaContainer = document.getElementById('modalEmoji');
    if (modalMediaContainer) {
        if (food.emoji && food.emoji.includes('/')) {
            modalMediaContainer.innerHTML = `<img src="${food.emoji}" style="width:80px;height:80px;object-fit:contain;" alt="">`;
        } else {
            modalMediaContainer.innerText = food.emoji;
        }
    }

    const modalName = document.getElementById('modalName');
    if (modalName) modalName.innerText = food.name[currentLang];

    const modalDesc = document.getElementById('modalDesc');
    if (modalDesc) {
        if (food.isJunk) {
            modalDesc.innerHTML = `<span style="color:#e11d48; font-weight:800;">⚠️ Junk Food</span><br>${food.desc[currentLang]}`;
        } else {
            modalDesc.innerHTML = `<span style="color:#16a34a; font-weight:800;">✨ Healthy Food</span><br>${food.desc[currentLang]}`;
        }
    }

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

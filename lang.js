const translations = {
    ja: {
        charSelectTitle: "キャラを えらんでね！",
        fullnessLabel: "😋 まんぷく",
        expLabel: "⭐ れべる",
        inventoryTitle: "🎒 もちもの",
        shopTitle: "🛒 おみせ",
        shopSub: "みせを えらんでね！",
        myPageTitle: "📖 じぶんの ぺーじ",
        evoTitle: "📈 しんか",
        guideTitle: "💡 ずかん",
        langChangeTitle: "🌐 げんご せってい",
        navHome: "おうち",
        navMiniGame: "ミニゲーム",
        navShop: "おみせ",
        navMyPage: "じぶん",
        catVeg: "やさい",
        catMeat: "のおにく",
        catSnack: "おやつ",
        catDairy: "にゅうせいひん",
        btnFeed: "あげる",
        btnBuy: "かう",
        btnNext: "おうちへもどる ✨",
        btnExitGame: "🏠 もどる",
        popupGameTitle: "入場料 🪙 100 かかります",
        popupGameDesc: "ゲームを はじめますか？",
        btnCancel: "やめる ❌",
        btnStart: "はじめる ⭕",
        msgLevelUp: "レベルアップ！",
        msgFeed: "たべたよ！",
        msgBuy: "かったよ！",
        msgNoCoin: "コインが たりないよ！",
        msgNotEnoughCoinGame: "入場料にコインが 100ひつようだよ！"
    },
    my: {
        charSelectTitle: "Character ရွေးချယ်ပါ",
        fullnessLabel: "😋 ဗိုက်ပြည့်မှု",
        expLabel: "⭐ Level EXP",
        inventoryTitle: "🎒 ပစ္စည်းအိတ်",
        shopTitle: "🛒 အစားအစာ ဈေးဆိုင်",
        shopSub: "ဆိုင် အမျိုးအစား ရွေးပါ",
        myPageTitle: "📖 Dashboard",
        evoTitle: "📈 ကြီးထွားမှု",
        guideTitle: "💡 အာဟာရ ဗဟုသုတ",
        langChangeTitle: "🌐 ဘာသာစကား ပြောင်းရန်",
        navHome: "Home",
        navMiniGame: "Mini Game",
        navShop: "Shop",
        navMyPage: "Profile",
        catVeg: "အသီးအရွက်",
        catMeat: "အသား/ငါး",
        catSnack: "မုန့်/သရေစာ",
        catDairy: "နို့ထွက်ပစ္စည်း",
        btnFeed: "ကျွေးမည်",
        btnBuy: "ဝယ်မည်",
        btnNext: "Home သို့ ပြန်မည် ✨",
        btnExitGame: "🏠 ပြန်မည်",
        popupGameTitle: "ဝင်ကြေး 🪙 100 ကျသင့်မည်",
        popupGameDesc: "ဂိမ်း စတင်ဆော့မလား?",
        btnCancel: "မဆော့တော့ပါ ❌",
        btnStart: "စတင်မည် ⭕",
        msgLevelUp: "Level တက်သွားပါပြီ!",
        msgFeed: "ကျွေးလိုက်ပါပြီ!",
        msgBuy: "ဝယ်ယူပြီးပါပြီ!",
        msgNoCoin: "Coin မလုံလောက်ပါ!",
        msgNotEnoughCoinGame: "ဂိမ်းဆော့ရန် Coin 100 လိုအပ်ပါသည်!"
    }
};

const charactersData = {
    mogu: {
        name: { ja: "モグちゃん", my: "Mogu-chan" },
        desc: { ja: "はっぱの ようせい", my: "အရွက်ပေါက်လေး" },
        stages: [
            { level: 1, avatar: "img/moguidle.png", title: { ja: "あかちゃん", my: "Baby" } },
            { level: 2, avatar: "img/moguidle.png", title: { ja: "こども", my: "Child" } },
            { level: 3, avatar: "img/moguidle.png", title: { ja: "おとな", my: "Adult" } }
        ]
    },
    piyo: {
        name: { ja: "ピヨちゃん", my: "Piyo-chan" },
        desc: { ja: "ひよこ", my: "ကြက်ပေါက်စ" },
        stages: [
            { level: 1, avatar: "img/piyoidle.png", title: { ja: "たまご", my: "Egg" } },
            { level: 2, avatar: "img/piyoidle.png", title: { ja: "ひよこ", my: "Chick" } },
            { level: 3, avatar: "img/piyoidle.png", title: { ja: "トリ", my: "Bird" } }
        ]
    }
};

const foodsData = {
    apple:      { category: 'veg', reqLevel: 1, emoji: "🍎", price: 10, fullness: 15, exp: 10, isJunk: false, name: { ja: "りんご", my: "ပန်းသီး" }, desc: { ja: "ビタミンたっぷりで げんき！", my: "Vitamin C ကျန်းမာရေး" } },
    banana:     { category: 'veg', reqLevel: 1, emoji: "🍌", price: 10, fullness: 15, exp: 10, isJunk: false, name: { ja: "バナナ", my: "ငှက်ပျောသီး" }, desc: { ja: "すぐ エネルギーになるよ", my: "စွမ်းအင်ရရှိစေသည်" } },
    carrot:     { category: 'veg', reqLevel: 1, emoji: "🥕", price: 15, fullness: 20, exp: 15, isJunk: false, name: { ja: "にんじん", my: "မုန်လာဥနီ" }, desc: { ja: "目が よくなるよ", my: "မျက်စိအားကောင်းစေသည်" } },
    broccoli:   { category: 'veg', reqLevel: 1, emoji: "🥦", price: 15, fullness: 20, exp: 15, isJunk: false, name: { ja: "ブロッコリー", my: "ပန်းပွင့်စိမ်း" }, desc: { ja: "からだを まもるよ", my: "ခုခံအား တိုးစေသည်" } },
    egg:        { category: 'meat', reqLevel: 1, emoji: "🥚", price: 15, fullness: 20, exp: 15, isJunk: false, name: { ja: "たまご", my: "ကြက်ဥ" }, desc: { ja: "からだを つくるよ", my: "ကြွက်သား သန်မာစေသည်" } },
    fish:       { category: 'meat', reqLevel: 1, emoji: "🐟", price: 25, fullness: 30, exp: 20, isJunk: false, name: { ja: "さかな", my: "ငါး" }, desc: { ja: "あたまが よくなるよ", my: "ဦးနှောက် ဖွံ့ဖြိုးစေသည်" } },
    donut:      { category: 'snack', reqLevel: 1, emoji: "🍩", price: 20, fullness: 30, exp: 5,  isJunk: true,  name: { ja: "ドーナツ", my: "ဒိုးနတ်" }, desc: { ja: "ジャンクフード", my: "Junk Food" } },
    frenchfries:{ category: 'snack', reqLevel: 1, emoji: "🍟", price: 25, fullness: 35, exp: 5,  isJunk: true,  name: { ja: "ポテト", my: "အာလူးကြော်" }, desc: { ja: "ジャンクフード", my: "Junk Food" } },
    hamburger:  { category: 'snack', reqLevel: 1, emoji: "🍔", price: 30, fullness: 40, exp: 5,  isJunk: true,  name: { ja: "バーガー", my: "ဟမ်ဘာဂါ" }, desc: { ja: "ジャンクフード", my: "Junk Food" } },
    milk:       { category: 'dairy', reqLevel: 1, emoji: "🥛", price: 15, fullness: 20, exp: 15, isJunk: false, name: { ja: "ぎゅうにゅう", my: "နွားနို့" }, desc: { ja: "ほねが つよくなるよ", my: "အရိုး သန်မာစေသည်" } }
};
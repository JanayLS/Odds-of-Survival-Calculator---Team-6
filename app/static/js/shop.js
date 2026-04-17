// shop.js
const shopScene = document.getElementById("shopScene");

shopScene.innerHTML = `
    <img id="plagueDoctor" src="/static/img/characters/plagueDoctor.png">
    <img id="shop-owner" src="/static/img/characters/shop-owner.png">

    <div id="shopDialogueBox">
        <div id="shopCharacterName">Rosemary Thornsmith:</div>
        <div id="shopDialogueText"></div>
        <div id="shopNextArrow">➤</div>
    </div>

    <div id="shopPanel">
        <h3>Shop</h3>
        <div id="shopItems"></div>
    </div>

    <audio id="shopMusic" src="/static/shopMusic.mp3" loop></audio>
`;

const shopPanel = document.getElementById('shopPanel');
const boostItems = Object.values(itemDatabase).filter(item => item.category === "charm");
const randomItem = boostItems[Math.floor(Math.random() * boostItems.length)];
const shopItemSound = new Audio('/static/sound-effects/misc-sounds/buy-item.wav');
const shopDialogueBox = document.getElementById("shopDialogueBox");
const shopDialogueText = document.getElementById("shopDialogueText");
const shopNextArrow = document.getElementById("shopNextArrow");

const shopGreeting = "Welcome, Doctor. It's not much, but I hope you can find what you need.";
const shopThanksLine = "Thank you! Is there anything else you need?";

let shopIsTyping = false;
let shopTypingSpeed = 35;
let shopTypingInterval = null;

function typeShopDialogue(line) {
    if (shopTypingInterval) {
        clearInterval(shopTypingInterval);
    }

    shopDialogueText.textContent = "";
    shopNextArrow.style.opacity = 0;
    shopIsTyping = true;

    let i = 0;

    shopTypingInterval = setInterval(() => {
        const char = line.charAt(i);
        shopDialogueText.textContent += char;

        if (char !== "" && typeof playRandomTypeSound === "function") {
            playRandomTypeSound();
        }

        i++;

        if (i >= line.length) {
            clearInterval(shopTypingInterval);
            shopTypingInterval = null;
            shopIsTyping = false;
        }
    }, shopTypingSpeed);
}

function resetShopDialogue() {
    typeShopDialogue(shopGreeting);
}

function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function renderShopItems() {
    const shopContainer = document.getElementById("shopItems");
    shopContainer.innerHTML = "";

    gameState.shopItems.forEach(item => {
        const itemCard = document.createElement("div");
        itemCard.className = "shop-item";

        const img = document.createElement("img");
        img.src = item.img;
        img.className = "shopItem";
        img.title = item.name;

        const name = document.createElement("div");
        name.className = "shop-item-name";
        name.textContent = item.name;

        const price = document.createElement("div");
        price.className = "shop-item-price";
        price.textContent = `${item.price} coins`;

        itemCard.appendChild(img);
        itemCard.appendChild(name);
        itemCard.appendChild(price);

        shopContainer.appendChild(itemCard);

        img.addEventListener("mouseover", () => {
            showItemDescription(item);
        });

        img.addEventListener("mouseleave", () => {
            hideItemDescription();
        });

        itemCard.addEventListener("click", () => {
            buyShopItem(item);
        });
    });
}

function buyShopItem(item) {
    if (!spendMoney(item.price)) {
        alert("Not enough money.");
        return;
    }

    shopItemSound.currentTime = 0;
    shopItemSound.play();

    hideItemDescription();
    spendActionToken();
    addItemToInventory(item);

    const itemIndex = gameState.shopItems.findIndex(shopItem => shopItem.name === item.name);
    if (itemIndex !== -1) {
        gameState.shopItems.splice(itemIndex, 1);
    }

    renderShopItems();
    typeShopDialogue(shopThanksLine);
}

function refreshShopInventory() {
    gameState.shopItems = getRandomItems(boostItems, 3);
    renderShopItems();
    resetShopDialogue();
}

if (!gameState.shopItems || gameState.shopItems.length === 0) {
    refreshShopInventory();
} else {
    renderShopItems();
    resetShopDialogue();
}
const shopScene = document.getElementById("shopScene");

shopScene.innerHTML = `
    <img id="plagueDoctor" src="images/characters/plagueDoctor.png">
    <img id="shop-owner" src="images/characters/shop-owner.png">

    <!-- Dialogue System (Character Name, Dialogue Text, Player Choices, Next Arrow for Navigation) -->
    <div id="shopDialogueBox">
        <div id="shopCharacterName">Rosemary Thornsmith:</div>
        <div id="shopDialogueText"></div>
        <div id="shopNextArrow">➤</div>
    </div>

    <!-- Shop Panel -->
    <div id="shopPanel">
        <h3>Shop</h3>
        <div id="shopItems"></div>
    </div>

    <!-- Game Audio -->
    <audio id="shopMusic" src="shopMusic.mp3" loop></audio>
`
// Grab HTML Elements
const shopPanel = document.getElementById('shopPanel')
const boostItems = Object.values(itemDatabase).filter(item => item.category === "charm");
const ingredientItems = Object.values(itemDatabase).filter(item => item.category === "ingredient");
const randomItem = boostItems[Math.floor(Math.random() * boostItems.length)];
const shopItemSound = new Audio('sound-effects/misc-sounds/buy-item.wav');
const shopDialogueBox = document.getElementById("shopDialogueBox");
const shopDialogueText = document.getElementById("shopDialogueText");
const shopNextArrow = document.getElementById("shopNextArrow");

// --------------------------------------
// SHOP DIALOGUE
// --------------------------------------
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

        if (char != "" && typeof playRandomTypeSound === "function") {
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

// Randomize Item
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Renders Shop Items in Shop Panel
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
        })

        img.addEventListener("mouseleave", () => {
            hideItemDescription();
        })

        itemCard.addEventListener("click", () => {
            buyShopItem(item);
        })

    })
}

// Buy shop item
function buyShopItem(item) {

    if (!canSpendActionToken(1)) {
        return;
    }

    if (!spendMoney(item.price)) {
        alert("Not enough money.");
        return;
    }

    shopItemSound.currentTime = 0;
    shopItemSound.play();

    hideItemDescription();
    spendActionToken(1);
    addItemToInventory(item);

    const itemIndex = gameState.shopItems.findIndex(shopItem => shopItem.name === item.name);
    if (itemIndex !== -1) {
        gameState.shopItems.splice(itemIndex, 1);
    }

    renderShopItems();
    typeShopDialogue(shopThanksLine);
}

// Shop items replenish when it's a new Day
function refreshShopInventory() {
    const randomCharms = getRandomItems(boostItems, 3);
    const randomIngredients = getRandomItems(ingredientItems, 7);

    gameState.shopItems = [...randomCharms, ...randomIngredients];
    renderShopItems();
    resetShopDialogue();
}

// Startup Logic
if (!gameState.shopItems || gameState.shopItems.length === 0) {
    refreshShopInventory();
} else {
    renderShopItems();
    resetShopDialogue();
}
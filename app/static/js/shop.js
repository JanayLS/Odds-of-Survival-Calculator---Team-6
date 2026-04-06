const shopScene = document.getElementById("shopScene");

shopScene.innerHTML = `
    <img id="plagueDoctor" src="/static/img/characters/plagueDoctor.png">
    <img id="shop-owner" src="/static/img/characters/shop-owner.png">

    <!-- Dialogue System (Character Name, Dialogue Text, Player Choices, Next Arrow for Navigation) -->
    <div id="dialogueBox">
        <div id="characterName">Rosemary Thornsmith:</div>
        <div id="dialogueText"></div>
        <div id="nextArrow">➤</div>
    </div>

    <!-- Shop Panel -->
    <div id="shopPanel">
        <h3>Shop</h3>
        <div id="shopItems"></div>
    </div>

    <!-- Game Audio -->
    <audio id="shopMusic" src="/static/audio/shopMusic.mp3" loop></audio>
`
// Grab HTML Elements
const shopPanel = document.getElementById('shopPanel')
const boostItems = Object.values(itemDatabase).filter(item => item.category === "charm");
const randomItem = boostItems[Math.floor(Math.random() * boostItems.length)];
const shopItemSound = new Audio('/static/sound-effects/misc-sounds/buy-item.wav');

// Dynamically Stores Items
let shopItems = [];

// Randomize Item
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

shopItems = getRandomItems(boostItems, 3);

// Renders Shop Items in Shop Panel
function renderShopItems() {

    const shopContainer = document.getElementById("shopItems");
    shopContainer.innerHTML = "";

    shopItems.forEach(item => {

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

renderShopItems();

function buyShopItem(item) {
    if (!spendMoney(item.price)) {
        alert("Not enough money.");
        return;
    }

    shopItemSound.play();
    addItemToInventory(item);

    const itemIndex = shopItems.indexOf(item);
    if (itemIndex !== -1) {
        shopItems.splice(itemIndex, 1);
    }

    renderShopItems();
}
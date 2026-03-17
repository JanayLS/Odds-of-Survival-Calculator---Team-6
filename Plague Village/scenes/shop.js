const shopScene = document.getElementById("shopScene");

shopScene.innerHTML = `
        <img id="plagueDoctor" src="plagueDoctor.png">
        <img id="shop-owner" src="images/characters/shop-owner.png">

        <!-- Dialogue System (Character Name, Dialogue Text, Player Choices, Next Arrow for Navigation) -->
        <div id="dialogueBox">
            <div id="characterName">Rosemary Thornsmith:</div>
            <div id="dialogueText"></div>
            <!-- <div id="choiceBox">
                <button class="choiceBtn" data-choice="item1">
                    Buy Item 1
                </button>
                <button class="choiceBtn" data-choice="item2">
                    Buy Item 2
                </button>
                <button class="choiceBtn" data-choice="item3">
                    Buy Item 3
                </button>
            </div> -->
            <div id="nextArrow">➤</div>
        </div>

        <!-- Shop Button -->
        <button id="shopBtn">Buy Items</button>

        <!-- Shop -->
        <div id="shopPanel" style="display: none;">
            <h3>Shop</h3>
            <div id="shopItems"></div>
        </div>

    <!-- Game Audio -->
    <audio id="shopMusic" src="shopMusic.mp3" loop></audio>
    <!-- Typing Sounds -->
    <audio class="typeSound" src="type1.ogg" preload="auto"></audio>
    <audio class="typeSound" src="type2.ogg" preload="auto"></audio>
    <audio class="typeSound" src="type3.ogg" preload="auto"></audio>
    <audio class="typeSound" src="type4.ogg" preload="auto"></audio>
    <audio class="typeSound" src="type5.ogg" preload="auto"></audio>
    <audio class="typeSound" src="type6.ogg" preload="auto"></audio>
    <audio class="typeSound" src="type7.ogg" preload="auto"></audio>
    <audio class="typeSound" src="type8.ogg" preload="auto"></audio>
    <audio class="typeSound" src="type9.ogg" preload="auto"></audio>
    <audio class="typeSound" src="type10.ogg" preload="auto"></audio>
`

const shopBtn = document.getElementById('shopBtn');
const shopPanel = document.getElementById('shopPanel')
const boostItems = Object.values(itemDatabase).filter(item => item.category === "boost-item");
const randomItem = boostItems[Math.floor(Math.random() * boostItems.length)];

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

        const img = document.createElement("img");
        img.src = item.img;
        img.className = "shopItem";
        img.title = item.name;

        shopContainer.appendChild(img);

        img.addEventListener("click", () => {
            showItemDescription(item);
        })

    })
}

shopItems.push(randomItem);
renderShopItems();

shopBtn.addEventListener("click", () => {
    if (shopPanel.style.display == "none") {
        shopPanel.style.display = "block";
    } else {
        shopPanel.style.display = "none";
    }
})
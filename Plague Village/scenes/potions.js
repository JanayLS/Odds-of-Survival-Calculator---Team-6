const potionsScene = document.getElementById("potionsScene");

potionsScene.innerHTML = `
    <img id="plagueDoctor" src="images/characters/plagueDoctor.png">

    <!-- Brewing Area -->
    <div id="brewingPanel">
        <h3>Brewing</h3>

        <div class="brewSection">
            <span class="brewLabel">Ingredients</span>
            <div class="brewingSlots">
                <div class="brewSlot" data-slot="ingredient1"></div>
                <div class="brewSlot" data-slot="ingredient2"></div>
                <div class="brewSlot" data-slot="ingredient3"></div>
            </div>
        </div>

        <div class="brewSection">
            <span class="brewLabel">Charm (Optional)</span>
            <div class="brewingSlots">
                <div class="brewSlot charmSlot" data-slot="charm"></div>
            </div>
        </div>

        <button id="brewBtn" class="glow-btn">Brew</button>
    </div>

    <!-- Potion Result Panel -->
    <div id="potionResultPanel" class="result-panel">
        <h3>Result</h3>
        <div id="potionResultSlot" class="result-slot"></div>
        <p id="potionResultText">Brew something...</p>
    </div>
        
    <!-- Recipe Book Button -->
    <button id="recipeBookBtn">Recipe Book</button>

    <!-- Recipe Book Screen -->
    <div id="recipeBookScreen" class="hidden">
        <button id="closeRecipeBookBtn">Close Book</button>

        <div class="book-wrapper">
            <img src="images/misc-images/recipe-book.png" id="recipeBookImg">

            <!-- Left Page -->
            <div class="book-page left-page">
                <!-- Healing Tonic Recipe -->
                <div class="recipe-entry">
                    <h3 class="recipe-title">Healing Tonic</h3>

                    <div class="potion-display">
                        <img src="images/potions/mint-healing-tonic.png">
                    </div>

                    <div class="ingredient-row">
                        <div class="ingredient">
                            <img src="images/ingredients/silverleaf.png">
                            <span>Silverleaf</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/yarrow.png">
                            <span>Yarrow</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/mint.png">
                            <span>Mint</span>
                        </div>
                    </div>
                </div>
                <!-- Fever sant Recipe -->
                <div class="recipe-entry">
                    <h3 class="recipe-title">Fever Suppressant</h3>

                    <div class="potion-display">
                        <img src="images/potions/fever-suppressant.png">
                    </div>

                    <div class="ingredient-row">
                        <div class="ingredient">
                            <img src="images/ingredients/thyme.png">
                            <span>Thyme</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/hawthorne.png">
                            <span>Hawthorne</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/mint.png">
                            <span>Mint</span>
                        </div>
                    </div>
                </div>
                <!-- Plague Concoction Recipe -->
                <div class="recipe-entry">
                    <h3 class="recipe-title">Plague Concoction</h3>

                    <div class="potion-display">
                        <img src="images/potions/plague-concoction.png">
                    </div>

                    <div class="ingredient-row">
                        <div class="ingredient">
                            <img src="images/ingredients/bitter-mushroom.png">
                            <span>Bitter Mushroom</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/molded-bark.png">
                            <span>Molded Bark</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/charcoal-powder.png">
                            <span>Charcoal Powder</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="book-page right-page">
                <!-- Ash Remedy -->
                <div class="recipe-entry">
                    <h3 class="recipe-title">Ash Remedy</h3>

                    <div class="potion-display">
                        <img src="images/potions/ash-remedy.png">
                    </div>

                    <div class="ingredient-row">
                        <div class="ingredient">
                            <img src="images/ingredients/bone-ash.png">
                            <span>Bone Ash</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/garlic-bulb.png">
                            <span>Garlic Bulbs</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/charcoal-powder.png">
                            <span>Charcoal Powder</span>
                        </div>
                    </div>
                </div>
                <!-- Elixir Recipe -->
                <div class="recipe-entry">
                    <h3 class="recipe-title">Elixir</h3>

                    <div class="potion-display">
                        <img src="images/potions/elixir.png">
                    </div>

                    <div class="ingredient-row">
                        <div class="ingredient">
                            <img src="images/ingredients/silverleaf.png">
                            <span>Silverleaf</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/garlic-bulb.png">
                            <span>Garlic Bulbs</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/charcoal-powder.png">
                            <span>Charcoal Powder</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
`
// *************************************
// POTION BREWING **********************
//**************************************

// Potion Brewing System
setupBrewingSlots();
const potionBrewSound = new Audio('sound-effects/potion-sounds/potion-brewed.wav')
let brewedPotion = null;

let brewingSlots = {
    ingredient1: null,
    ingredient2: null,
    ingredient3: null,
    charm: null
}

function setupBrewingSlots() {
    document.querySelectorAll(".brewSlot").forEach(slot => {
        slot.addEventListener("click", () => {

            if (!window.selectedItem) return;

            const slotType = slot.dataset.slot;
            const item = window.selectedItem;

            // Potions cannot go in Brew Panel
            if (item.category === "potion") return;

            // Only items with "charm" type go in charm slot
            if (slotType === "charm" && item.category !== "charm") return;

            // Ingredient slots do NOT accept charm items
            if (slotType !== "charm" && item.category !== "ingredient") return;

            // If player fills already filled brewing slot with new item, old item returns to inventory and new item fills the slot
            const oldItem = brewingSlots[slotType]

            if (oldItem) {
                addItemToInventory(oldItem);
            }

            brewingSlots[slotType] = item;
            removeItemFromInventory(item);
            renderBrewingSlots();
            window.selectedItem = null;
        })
    })
}

function renderBrewingSlots() {
    document.querySelectorAll(".brewSlot").forEach(slot => {
        const slotType = slot.dataset.slot;
        const item = brewingSlots[slotType];

        slot.innerHTML = "";

        if (item) {
            const img = document.createElement("img");
            img.src = item.img;
            img.style.width = "80%";
            img.style.height = "80%";
            img.style.objectFit = "contain";

            img.addEventListener("click", () => {
                addItemToInventory(item);
                brewingSlots[slotType] = null;
                renderBrewingSlots();
            });

            slot.appendChild(img);
        }
    })
}

document.getElementById("brewBtn").addEventListener("click", brewPotion);

function brewPotion() {
    const ing1 = brewingSlots.ingredient1;
    const ing2 = brewingSlots.ingredient2;
    const ing3 = brewingSlots.ingredient3;
    const resultSlot = document.getElementById("potionResultSlot");
    const resultText = document.getElementById("potionResultText");

    // Make sure all 3 slots are filled
    if (!ing1 || !ing2 || !ing3) {
        resultText.textContent = "Not enough ingredients.";
        return;
    }

    // Get ingredient names and sort so order doesn't matter
    const ingredients = [ing1.name, ing2.name, ing3.name].sort();

    let matchedRecipe = null;

    for (const key in recipeDatabase) {
        const recipe = recipeDatabase[key];

        const recipeIngredients = [...recipe.ingredients].sort();

        const isMatch =
            ingredients.length === recipeIngredients.length &&
            ingredients.every((item, i) => item === recipeIngredients[i]);

        if (isMatch) {
            matchedRecipe = recipe;
            break;
        }
    }

    if (matchedRecipe) {
        // Potion Brewing Sound Effect
        potionBrewSound.currentTime = 0;
        potionBrewSound.play();

        brewedPotion = chooseWeightedPotionTier(matchedRecipe.result);
        resultSlot.innerHTML = `<img class="potion-result" src="${brewedPotion.img}" alt="${brewedPotion.name}">`;
        resultText.textContent = brewedPotion.name;
    } else {
        brewedPotion = null;
        console.log("Unknown Potion");
    }
}

// When player clicks brewed potion, potion is added to inventory, and result slot is cleared.
document.getElementById("potionResultSlot").addEventListener("click", () => {
    if (!brewedPotion) return;

    addItemToInventory(brewedPotion);

    brewedPotion = null;
    document.getElementById("potionResultSlot").innerHTML = "";
    document.getElementById("potionResultText").textContent = "Brew something...";
})

// Potion Tier Randomness
function chooseWeightedPotionTier(familyName) {
    const matchingPotions = Object.values(itemDatabase).filter(item =>
        item.category === "potion" && item.family === familyName
    );

    const weakPotion = matchingPotions.find(item => item.tier === "weak");
    const midPotion = matchingPotions.find(item => item.tier === "mid");
    const strongPotion = matchingPotions.find(item => item.tier === "strong");

    const roll = Math.random();

    if (roll < 0.2) return weakPotion; // 20% chance of weak potion
    if (roll < 0.8) return midPotion; // 80% chance of mid potion
    return strongPotion; // 20% chance of strong potion
}

// *************************************
// RECIPE BOOK *************************
//**************************************

// Recipe Book Button
const recipeBookBtn = document.getElementById('recipeBookBtn')
const closeRecipeBookBtn = document.getElementById('closeRecipeBookBtn')
const recipeBookScreen = document.getElementById('recipeBookScreen')
const bookSound = new Audio('sound-effects/misc-sounds/page-turn.wav')

// Recipe Book Button
recipeBookBtn.addEventListener("click", () => {
    recipeBookScreen.classList.remove("hidden");

    bookSound.currentTime = 0;
    bookSound.play();
    bookSound.volume = 1;
});

closeRecipeBookBtn.addEventListener("click", () => {
    recipeBookScreen.classList.add("hidden");

    bookSound.currentTime = 0;
    bookSound.play();
    bookSound.volume = 1;
})
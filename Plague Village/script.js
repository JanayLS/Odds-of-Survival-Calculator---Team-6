// MAIN JS FILE, SWITCHES TO OTHER JS FILES BASED ON SCENE CHANGE
//
//
// INITIALIZE HTML ELEMENTS
// -------------------------------------------------------------
// Characters
const villager1 = document.getElementById('villager1');
const worriedVillagerWoman = document.getElementById('worriedVillagerWoman')
const characterName = document.getElementById('characterName');

// Controls current dialogue branch/scene state
// Starts as intro, changes as scene progresses
let sceneState = "intro";

// Main Menu, Arrival Scene, Start Game Button
const mainMenu = document.getElementById('mainMenu');
const arrivalScene = document.getElementById('arrivalScene')
const startGameBtn = document.getElementById('startGameBtn')

// Music Button
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
bgm.load();

// Typing Sounds
const typeSounds = document.querySelectorAll('.typeSound');
let lastSoundIndex = -1;
// Randomizes typing sounds
function playRandomTypeSound() {
    let randomIndex;

    do {
        randomIndex = Math.floor(Math.random() * typeSounds.length);
    } while (randomIndex === lastSoundIndex);

    lastSoundIndex = randomIndex;

    const sound = typeSounds[randomIndex];
    sound.currentTime = 0;
    sound.volume = 0.7 + Math.random() * 0.3;
    sound.play();
}

// Choice Box Elements
const choiceBox = document.getElementById('choiceBox');
const choiceButtons = document.querySelectorAll('.choiceBtn')

// Dialogue Box and Text
const dialogueBox = document.getElementById('dialogueBox');
const dialogueText = document.getElementById('dialogueText');
const arrow = document.getElementById('nextArrow');

// Inventory
const inventoryBtn = document.getElementById('inventoryBtn');
const inventoryPanel = document.getElementById('inventoryPanel');
const inventoryHintArrow = document.getElementById('inventoryHintArrow');
const inventoryTabs = document.querySelectorAll(".inventoryTab");
let activeInventoryTab = "ingredients";
const menuHoverSound = new Audio('sound-effects/misc-sounds/menu-hover.wav')

// Travel
const travelBtn = document.getElementById("travelBtn");
const travelPanel = document.getElementById("travelPanel");
const travelLocations = document.getElementById("travelLocations");

// Objectives
const objectiveBtn = document.getElementById("objectiveBtn");
const objectivePanel = document.getElementById("objectivePanel");

// Doctor Infection Status (Start at 50 for now while testing, change later)
let doctorInfection = 50;

function renderDoctorInfection() {
    const bar = document.getElementById("doctorInfectionBar");
    const value = document.getElementById("doctorInfectionValue");

    bar.style.width = `${doctorInfection}%`;
    value.textContent = `${doctorInfection}%`;
}

renderDoctorInfection();

// TRANSITION FROM MENU SCENE TO ARRIVAL/INTRO SCENE
// ------------------------------------------------
showScene("mainMenu")

startGameBtn.addEventListener("mouseover", () => {
    menuHoverSound.play();
})

startGameBtn.addEventListener("click", () => {

    // Hide main menu and show Arrival scene
    showScene("arrivalScene");

    // Start villager NPC dialogue
    currentLine = 0;
    dialogueText.innerHTML = "";
    typeLine(dialogueLines[currentLine]);
})

// DIALOGUE SYSTEM AND CHOICES 
// -------------------------------------------------
arrow.addEventListener("click", nextDialogue);

// Keyboard Navigation
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();

        // Only triggers if the main menu is NOT displayed
        if (mainMenu.style.display === "none") {
            nextDialogue();
        }
    }
    // Event Listener for b key press to go backwards
    if (e.key.toLowerCase() === "b") {
        previousDialogue();
    }
});

// Return player to the previous line
function previousDialogue() {
    if (isTyping) return;

    if (sceneState === "intro") {

        if (currentLine > 0) {
            currentLine--;
            typeLine(dialogueLines[currentLine]);
        }
    }
}

// Intro Scene Dialogue Lines (Villager 1 Opening Sequence)
const dialogueLines = [
    "Doctor...thank the Heavens you've arrived.",
    "Our people are sick. Some are dying.",
    "Rats roam our streets at night.",
    "If you cannot save us...no one will."
];

// Dialogue Typing Behavior
let currentLine = 0;
let isTyping = false;
let typingSpeed = 40;

// Typing Animation for Dialogue Text
// Disables Navigation Arrow while Typing
// Navigation arrow reappears when dialogue line is complete
function typeLine(line) {
    dialogueText.textContent = "";
    arrow.style.opacity = 0;
    let i = 0;
    isTyping = true;

    const interval = setInterval(() => {
        const char = line.charAt(i);
        dialogueText.textContent += char;

        if (char !== "") {
            playRandomTypeSound();
        }

        i++;

        if (i >= line.length) {
            clearInterval(interval);
            isTyping = false;
            arrow.style.opacity = 1;
        }
    }, typingSpeed);
}

// Advances dialogue based on choice selection/current scene state
function nextDialogue() {
    if (isTyping) return;

    // Intro (Original Dialogue Scene State)
    if (sceneState == "intro") {

        currentLine++;

        if (currentLine < dialogueLines.length) {
            typeLine(dialogueLines[currentLine]);
        } else {
            arrow.style.opacity = 0;
            choiceBox.style.display = "flex";
        }

        // Choice 1: Ask about Villagers
    } else if (sceneState == "villagers") {
        arrow.style.opacity = 0;

        choiceBox.innerHTML = `
        <button class="choiceBtn" data-choice="heal-villager">Heal Villager in Home</button>
        <button class="choiceBtn" data-choice="chapel">Pray at Chapel</button>`;

        choiceBox.style.display = "flex";

        // Choice 2: Ask about Rats
    } else if (sceneState == "rats") {
        arrow.style.opacity = 0;

        choiceBox.innerHTML = `
        <button class="choiceBtn" data-choice="fight-rats">Fight Rats</button>
        <button class="choiceBtn" data-choice="shop">Shop for Defense</button>`;

        choiceBox.style.display = "flex";

        // Choice 3: Ask about supplies
    } else if (sceneState == "supplies") {
        arrow.style.opacity = 0;

        choiceBox.innerHTML = `
        <button class="choiceBtn" data-choice="forest">Search Forest for Ingredients</button>
        <button class="choiceBtn" data-choice="potions">Brew Potions</button>`;

        choiceBox.style.display = "flex";
    }
};

// Choice Navigation
choiceBox.addEventListener("click", (e) => {

    if (!e.target.classList.contains("choiceBtn")) return;

    const choice = e.target.dataset.choice;

    choiceBox.style.display = "none";

    // Choice 1: Villager
    if (choice == "villagers") {
        sceneState = "villagers";
        currentLine = 0;

        characterName.textContent = "Worried Wife:";

        villager1.style.opacity = 0;
        worriedVillagerWoman.style.opacity = 1;

        setTimeout(() => {
            typeLine("Doctor...my husband hasn't woken in two days...")
        }, 600);

        // Calls function that generates # of villagers to be healed
        const villagersCount = generateVillagersObjective();
        updateObjectivePanel();
    }

    // Choice 2: Rats
    else if (choice == "rats") {
        sceneState = "rats";
        currentLine = 0;

        typeLine("The rats are the plague itself. They scurry through our village, infecting our people. One bite can mean death...");

        // Calls function that generates # of rats to fight
        const ratCount = generateRatObjective();
        updateObjectivePanel();
    }

    // Choice 3: Supplies
    else if (choice == "supplies") {
        sceneState = "supplies";
        currentLine = 0;

        characterName.textContent = "";

        inventoryHintArrow.style.opacity = "1";

        setTimeout(() => {
            inventoryHintArrow.style.opacity = "0";
        }, 4000);

        typeLine(`You check your satchel. Your supplies are limited. To create cures, you must gather ingredients from the forest.
                Each potion requires careful preparation. Mistakes may cost lives -- including your own.`);

        // Calls function to render random items in inventory
        giveRandomStartItems();
    }

    // Choice: Heal Villager
    else if (choice == "heal-villager") {
        showScene("villagerHealingScene");
    }

    // Choice: Chapel
    else if (choice == "chapel") {
        showScene("chapelScene");
    }

    // Choice: Rat Encounter
    else if (choice == "fight-rats") {
        showScene("ratScene");
    }

    // Choice: Shop for Defense
    else if (choice == "shop") {
        showScene("shopScene");
    }

    // Choice: Collect Ingredients in Forest
    else if (choice == "forest") {
        showScene("forestScene");
    }

    // Choice: Potions Scene
    else if (choice == "potions") {
        showScene("potionsScene");
    }
});

// --------------------------------------------------------------
// SCENE SWITCHING FUNCTION 
function showScene(sceneID) {

    const scenes = document.querySelectorAll(".scene");

    scenes.forEach(scene => {
        scene.style.display = "none";
    });

    document.getElementById(sceneID).style.display = "block";

    // Music within Scenes
    if (sceneID === "potionsScene") {
        bgm.src = "music/potionsMusic.mp3";
        bgm.load();
        // bgm.play();
    } else if (sceneID === "shopScene") {
        bgm.src = "music/shopMusic.mp3"
        bgm.load();
    }
}

// Add items to inventory (keeps track of quantity and decreases quantity when item is used)
function addItemToInventory(newItem) {
    const existingItem = inventory.find(item => item.name === newItem.name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        inventory.push({
            ...newItem,
            quantity: 1
        });
    }

    renderInventory();
}

// Remove items from inventory (decreases quantity of item or removes item if quantity was 1)
function removeItemFromInventory(itemToRemove) {
    const existingItem = inventory.find(item => item.name === itemToRemove.name);

    if (!existingItem) return;

    existingItem.quantity -= 1;

    if (existingItem.quantity <= 0) {
        const itemIndex = inventory.findIndex(item => item.name === itemToRemove.name);
        inventory.splice(itemIndex, 1);
    }

    renderInventory();
}


// WHEN PLAYER CHECKS MEDICAL SUPPLIES, 3 RANDOM ITEMS ARE GENERATED
let inventory = [];
let startItemsGiven = false;

function getRandomStartItems(itemDatabase, count = 5) {
    const itemPool = Object.entries(itemDatabase).map(([key, item]) => ({
        key,
        ...item
    }));

    const selectedItems = [];

    while (selectedItems.length < count && itemPool.length > 0) {
        const totalWeight = itemPool.reduce((sum, item) => sum + (item.weight ?? 1), 0);
        let randomNum = Math.random() * totalWeight;

        let selectedIndex = 0;

        for (let i = 0; i < itemPool.length; i++) {
            randomNum -= itemPool[i].weight;
            if (randomNum <= 0) {
                selectedIndex = i;
                break;
            }
        }

        selectedItems.push(itemPool[selectedIndex]);
        itemPool.splice(selectedIndex, 1);
    }

    return selectedItems;
}

// Gives 3 random start items when player first checks supplies
function giveRandomStartItems() {
    if (startItemsGiven) return;

    const startItems = getRandomStartItems(itemDatabase, 5);

    startItems.forEach(item => {
        addItemToInventory(item);
    });

    startItemsGiven = true;
    renderInventory();
}

// Renders Inventory Items in Inventory Panel
function renderInventory() {

    const inventoryItems = document.getElementById("inventoryItems");
    inventoryItems.innerHTML = "";

    const filteredItems = inventory.filter(item => {
        if (activeInventoryTab === "ingredients") return item.category === "ingredient";
        if (activeInventoryTab === "charm") return item.category === "charm";
        if (activeInventoryTab === "potions") return item.category === "potion";
        return false;
    });

    filteredItems.forEach(item => {
        const slot = document.createElement("div");
        slot.className = "inventorySlot";

        const img = document.createElement("img");
        img.src = item.img;
        img.className = "inventoryItem";
        img.title = item.name;

        // Add glow if item is emerald-boosted
        if (item.boostType === "emerald") {
            img.classList.add("emerald-boosted");
        }

        // Inventory item and quantity
        slot.appendChild(img);

        const quantityLabel = document.createElement("span");
        quantityLabel.className = "itemQuantity";
        quantityLabel.textContent = item.quantity;
        slot.appendChild(quantityLabel);

        inventoryItems.appendChild(slot);

        window.selectedItem = null;

        img.addEventListener("click", () => {
            if (activeInventoryTab === "potions") {
                useItem(item);
            } else {
                window.selectedItem = item;
            }
        });

        img.addEventListener("mouseenter", () => {
            menuHoverSound.play();
            showItemDescription(item);
        });

        img.addEventListener("mouseleave", () => {
            hideItemDescription();
        });
    });
}

inventoryTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        inventoryTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        activeInventoryTab = tab.dataset.tab;
        renderInventory();
    })

    tab.addEventListener("mouseover", () => {
        menuHoverSound.play();
    })
})

function showItemDescription(item) {

    const panel = document.getElementById("itemDescriptionPanel");
    const name = document.getElementById("itemDescriptionName");
    const text = document.getElementById("itemDescriptionText");

    name.textContent = item.name;
    text.textContent = item.description;

    panel.style.display = "block";
}

function hideItemDescription() {
    const panel = document.getElementById("itemDescriptionPanel");
    panel.style.display = "none";
}

// Game State Info - Work on this later
// let gameState = {
//     inventory: [],
//     coins: 10,
//     villagersHealed: 0,
//     plagueInfectionRate: 5,
// };

// Randomly Generates # of Rats to Fight, # of Villagers to Heal
// When a rat is defeated, ratsDefeated will be incremented. When ratsDefeated >= ratsObjective, no rats remain.
// When a villager is healed, villagersHealed will be incremented. When villagersHealed >= villagerObjective, all villagers are healed.
let ratObjective = null;
let ratsDefeated = 0;
let villagersObjective = null;
let villagersHealed = 0;

function generateRatObjective() {
    if (ratObjective !== null) return ratObjective;

    ratObjective = Math.floor(Math.random() * 5) + 3;
    return ratObjective;
}

function generateVillagersObjective() {
    if (villagersObjective !== null) return villagersObjective;

    villagersObjective = Math.floor(Math.random() * 4) + 3;
    return villagersObjective;
}

// Open Objectives Panel
objectiveBtn.addEventListener("click", () => {
    objectivePanel.classList.toggle("open");
})

// Updates game objectives (Rats, Villagers)
function updateObjectivePanel() {
    const objectiveContent = document.getElementById("objectiveContent");

    // let html = "";

    if (ratObjective !== null) {
        objectiveContent.innerHTML = `
        <div class="objectiveItem">
            <img src="images/misc-images/ratObjectiveIcon.png" class="objectiveIcon" alt="Rat objective icon">
            <span>Defeat ${ratObjective} rats. Progress: ${ratsDefeated}/${ratObjective}</span>
        </div>
        `;
    }

    if (villagersObjective !== null) {
        objectiveContent.innerHTML = `
        <div class="objectiveItem">
            <img src="images/misc-images/villagersObjectiveIcon.png" class="objectiveIcon" alt="Villagers objective icon">
            <span>Heal ${villagersObjective} villagers. Progress: ${villagersHealed}/${villagersObjective}</span>
        </div>
        `;
    }

    // if (html === "") {
    //     objectiveContent.textContent = "No active objectives.";
    // } else {
    //     objectiveContent.innerHTML = html; 
    // }

}

// BUTTONS
// --------------------------------------
// Music Button
musicBtn.addEventListener("click", () => {
    if (bgm.paused) {
        bgm.play();
        musicBtn.textContent = "Music Off";
    } else {
        bgm.pause();
        musicBtn.textContent = "Music On";
    }
})

// Inventory Button 
inventoryBtn.addEventListener("click", () => {
    inventoryPanel.classList.toggle("open");
}
)

// Travel
travelBtn.addEventListener("click", () => {
    travelPanel.classList.toggle("open");
}
)

travelLocations.addEventListener("click", (e) => {
    if (!e.target.classList.contains("travelLocationBtn")) return;

    const targetScene = e.target.dataset.scene;

    showScene(targetScene);

    travelPanel.classList.remove("open");
})

// --------------------------------------------------------------
// ITEM USE FUNCTIONS
// --------------------------------------------------------------
// useItem() is the entry point which calls other item use functions.
function useItem(item) {
    if (!item.effectType) return;

    const validation = validateItemUse(item);

    if (!validation.valid) {
        alert(validation.message);
        return;
    }

    const confirmed = confirm(`Use ${item.name}?`);
    if (!confirmed) return;

    const usedSuccessfully = applyItemEffect(item);

    if (!usedSuccessfully) return;

    if (item.category === "potion") {
        removeItemFromInventory(item);
    }

    renderInventory();
}

// validateItemUse() determines whether item can currently be used.
function validateItemUse(item) {
    switch (item.effectType) {
        case "reduceDoctorInfection":
            if (doctorInfection <= 0) {
                return { valid: false, message: "The Doctor is not infected." };
            }
            return { valid: true };

        case "reduceVillagerInfection":
            // Change this later so it only works in context of Heal Villager Scene
            return { valid: true };

        case "suppressVillagerInfection":
            // Change this later so it only works in context of Heal Villager Scene
            return { valid: true };

        case "poisonRat":
            // Change this later so it only works in context of Rat Encounter Scene
            return { valid: true };

        case "cureDoctorPoison":
            return { valid: true };

        default:
            return { valid: false, message: "This item cannot be used right now." };
    }
}

// applyItemEffect() applies the effect of the item.
function applyItemEffect(item) {
    switch (item.effectType) {
        case "reduceDoctorInfection":
            return applyReduceDoctorInfection(item);

        case "reduceVillagerInfection":
            return applyReduceVillagerInfection(item);

        case "suppressVillagerInfection":
            return applySuppressVillagerInfection(item);

        case "poisonRat":
            return applyPoisonRat(item);

        case "cureDoctorPoison":
            return applyCureDoctorPoison(item);

        default:
            return false;
    }
}

// applyReduceDoctorInfection - used by Elixir, reduces doctor's plague infection status
function applyReduceDoctorInfection(item) {
    let reductionAmt = 0;

    switch (item.tier) {
        case "weak":
            reductionAmt = 10;
            break;
        case "mid":
            reductionAmt = 20;
            break;
        case "strong":
            reductionAmt = 30;
            break;
        default:
            reductionAmt = 20;
    }

    if (item.boostType === "emerald") {
        reductionAmt += 20;
    }

    doctorInfection -= reductionAmt;

    if (doctorInfection < 0) doctorInfection = 0;
    if (doctorInfection > 100) doctorInfection = 100;

    renderDoctorInfection();
    return true;
}

// applyReduceVillagerInfection - used by Healing Tonic, reduces villager's plague infection status
function applyReduceVillagerInfection(item) {
    alert("Healing Tonic logic will connect to villager healing scene.");
    return false;
}

// applySuppressVillagerInfection - used by Fever Suppressant, keeps active villager infection from worsening at end of day. If it is
// brewed strong, it also reduces the villager's plague infection status slightly.
function applySuppressVillagerInfection(item) {
    alert("Fever Suppressant logic will connect to villager healing scene.");
    return false;
}

// applyPoisonRat - used by Plague Concoction, weakens rat attacks in battle
function applyPoisonRat(item) {
    alert("Plague Concoction logic will connect to rat encounter scene.");
    return false;
}

// applyCureDoctorPoison - used by Ash Remedy, reduces Doctor poison status
function applyCureDoctorPoison(item) {
    alert("Ash Remedy can be used by doctor in any scene.");
}

// --------------------------------------------------------------
// MONEY
// --------------------------------------------------------------
let money = 0;

function renderMoney() {
    document.getElementById("moneyValue").textContent = money;
}

function addMoney(amount) {
    money += amount;
    renderMoney();
}

function spendMoney(amount) {
    if (money < amount) return false;
    money -= amount;
    renderMoney();
    return true;
}

function loseMoney(amount) {
    money -= amount;
    if (money < 0) {
        money = 0;
    }

    renderMoney();
}

function setRandomStartMoney() {
    money = Math.floor(Math.random() * 6) + 100;
    renderMoney();
}

setRandomStartMoney();

// --------------------------------------------------------------
// END OF DAY
// --------------------------------------------------------------
// If herb satchel in inventory, Doctor Infection does not increase
// if (inventory.charms.herbSatchel > 0) {
//     // Doctor infection does not worsen
// } else {
//     // Doctor infection worsens
// }
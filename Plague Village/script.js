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

// Save / Load Button
const saveLoadBtn = document.getElementById("saveLoadBtn");
const saveLoadOverlay = document.getElementById("saveLoadOverlay");
const saveGameBtn = document.getElementById("saveGameBtn");
const loadGameBtn = document.getElementById("loadGameBtn");
const closeSaveLoadBtn = document.getElementById("closeSaveLoadBtn");

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

// Villager Select Overlay
const villagerSelectOverlay = document.getElementById("villagerSelectOverlay");
const villagerSelectList = document.getElementById("villagerSelectList");
const closeVillagerSelectBtn = document.getElementById("closeVillagerSelectBtn");
let currentVillagerKey = null;

// Rat Select Overlay
const ratSelectOverlay = document.getElementById("ratSelectOverlay");
const ratSelectList = document.getElementById("ratSelectList");
const closeRatSelectBtn = document.getElementById("closeRatSelectBtn");
let currentRatKey = null;

// Objectives
const objectiveBtn = document.getElementById("objectiveBtn");
const objectivePanel = document.getElementById("objectivePanel");

// End of Day Elements
const endOfDayOverlay = document.getElementById("endOfDayOverlay");
const closeEndOfDayBtn = document.getElementById("closeEndOfDayBtn");
const endOfDayText = document.getElementById("endOfDayText");

function renderDoctorInfection() {
    const bar = document.getElementById("doctorInfectionBar");
    const value = document.getElementById("doctorInfectionValue");

    bar.style.width = `${gameState.doctorInfection}%`;
    value.textContent = `${gameState.doctorInfection}%`;
}

renderDoctorInfection();

// VILLAGE INFECTION STATUS IS CALCULATED FROM # OF ACTIVE VILLAGERS WHO ARE HEALED/UNHEALED
function getVillageInfectionPercent() {

    const villagerKeys = Object.keys(gameState.villagers);

    const activeVillagers = villagerKeys.filter((key) => {
        return gameState.villagers[key].active === true;
    });

    // If no infected villagers have been selected yet, keep village looking toxic for now
    if (activeVillagers.length === 0) {
        return 100;
    }

    const unresolvedVillagers = activeVillagers.filter((key) => {
        const villager = gameState.villagers[key];
        return villager.healed === false;
    });

    const infectionPercent = (unresolvedVillagers.length / activeVillagers.length) * 100;

    return infectionPercent;
}

// RENDERS VILLAGE INFECTION IN THE VILLAGE INFECTION BAR
function renderVillageInfection() {
    const bar = document.getElementById("villageInfectionBar");
    const value = document.getElementById("villageInfectionValue");

    const villageInfection = getVillageInfectionPercent();

    bar.style.width = `${villageInfection}%`;
    value.textContent = `${Math.round(villageInfection)}%`
}

// CHANGES MAIN VILLAGE BACKGROUND DEPENDING ON VILLAGE INFECTION %
function updateVillageBackground() {
    const arrivalScene = document.getElementById("arrivalScene");
    const villageInfection = getVillageInfectionPercent();

    if (villageInfection < 30) {
        arrivalScene.style.backgroundImage = "url('images/backgrounds/healthyVillage.png')";
    } else if (villageInfection <= 70) {
        arrivalScene.style.backgroundImage = "url('images/backgrounds/midHealthVillage.png')";
    } else {
        arrivalScene.style.backgroundImage = "url('images/backgrounds/toxicVillage.png')";
    }
}

// UPDATES VILLAGE INFECTION BAR AND MAIN VILLAGE BACKGROUND SCENE
function updateVillageVisual() {
    renderVillageInfection();
    updateVillageBackground();
}

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
            showIntroChoices();
        }


    } else if (sceneState == "introResponse") {
        arrow.style.opacity = 0;
        showIntroChoices();
        sceneState = "intro";
    }
};

// Choice Navigation
choiceBox.addEventListener("click", (e) => {

    if (!e.target.classList.contains("choiceBtn")) return;

    const choice = e.target.dataset.choice;

    choiceBox.style.display = "none";

    // Choice 1: Villager
    if (choice == "villagers") {
        sceneState = "introResponse";
        characterName.textContent = "Worried Wife:";
        villager1.style.opacity = 0;
        worriedVillagerWoman.style.opacity = 1;

        // currentLine = 0;

        setTimeout(() => {
            typeLine("Doctor...my husband hasn't woken in two days...")
        }, 600);

        // Generate Objective 1: # of villagers to be healed
        // const villagersCount = 
        generateVillagersObjective();
        activateVillagersForRun();
        updateObjectivePanel();
        updateVillageVisual();
    }

    // Choice 2: Rats
    else if (choice == "rats") {
        sceneState = "introResponse";
        characterName.textContent = "Desperate Villager:";
        villager1.style.opacity = 1;
        worriedVillagerWoman.style.opacity = 0;

        // currentLine = 0;

        typeLine("The rats are the plague itself. They scurry through our village, infecting our people. One bite can mean death...");

        // Generates Objective 2: # of rats to fight
        // const ratCount = 
        generateRatObjective();
        updateObjectivePanel();
    }

    // Choice 3: Supplies
    else if (choice == "supplies") {
        sceneState = "introResponse";
        characterName.textContent = "";

        villager1.style.opacity = 1;
        worriedVillagerWoman.style.opacity = 0;

        inventoryHintArrow.style.opacity = "1";

        // currentLine = 0;

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

// Shows Intro Choices
function showIntroChoices() {
    choiceBox.innerHTML = `
        <button class="choiceBtn" data-choice="villagers">
            Ask about the sick villagers
        </button>
        <button class="choiceBtn" data-choice="rats">
            Ask about the rats
        </button>
        <button class="choiceBtn" data-choice="supplies">
            Inspect your medical supplies
        </button>
    `;
    choiceBox.style.display = "flex";
}

// --------------------------------------------------------------
// SCENE SWITCHING FUNCTION 
function showScene(sceneID) {

    const scenes = document.querySelectorAll(".scene");

    scenes.forEach(scene => {
        scene.style.display = "none";
    });

    hideItemDescription();
    document.getElementById(sceneID).style.display = "block";

    if (sceneID === "shopScene" && typeof resetShopDialogue === "function") {
        resetShopDialogue();
    }

    // If Player has no Action Tokens, End of Day report will be shown when they return to Arrival (Main Village) Scene
    if (sceneID === "arrivalScene" && gameState.actionTokens <= 0) {
        showEndOfDayReport();
    }

    // Renders villager infection when player enters villager healing scene
    if (sceneID === "villagerHealingScene") {
        renderVillagerInfection();
    }

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

// Add items to inventory (keeps track of quanitity and decreases quantity when item is used)
function addItemToInventory(newItem) {
    const existingItem = gameState.inventory.find(item => item.name === newItem.name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        gameState.inventory.push({
            ...newItem,
            quantity: 1
        });
    }

    renderInventory();
}

// Remove items from inventory (decreases quantity of item or removes item if quantity was 1)
function removeItemFromInventory(itemToRemove) {
    const existingItem = gameState.inventory.find(item => item.name === itemToRemove.name);

    if (!existingItem) return;

    existingItem.quantity -= 1;

    if (existingItem.quantity <= 0) {
        const itemIndex = gameState.inventory.findIndex(item => item.name === itemToRemove.name);
        gameState.inventory.splice(itemIndex, 1);
    }

    renderInventory();
}


// WHEN PLAYER CHECKS MEDICAL SUPPLIES, 3 RANDOM ITEMS ARE GENERATED
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

    const filteredItems = gameState.inventory.filter(item => {
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
        hideItemDescription();
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

// GENERATE RAT OBJECTIVE
function generateRatObjective() {
    if (gameState.ratsToKill > 0) return gameState.ratsToKill;

    gameState.ratsToKill = 5;
    return gameState.ratsToKill;
}

// GENERATE VILLAGER OBJECTIVE
function generateVillagersObjective() {
    if (gameState.villagersToHeal > 0) return gameState.villagersToHeal;

    gameState.villagersToHeal = Math.floor(Math.random() * 4) + 3;
    return gameState.villagersToHeal;
}

// WHEN VILLAGER OBJECTIVE IS GENERATED, RANDOM VILLAGERS ARE CHOSEN FROM THE VILLAGER DATABASE TO BE USED IN CURRENT PLAYTHROUGH
function activateVillagersForRun() {
    const villagerKeys = Object.keys(gameState.villagers);
    const alreadyActive = villagerKeys.some((key) => gameState.villagers[key].active);

    if (alreadyActive) return;

    // Reset all villagers first
    villagerKeys.forEach((key) => {
        gameState.villagers[key].active = false;
        gameState.villagers[key].healed = false;
        gameState.villagers[key].dead = false;
        gameState.villagers[key].feverSuppressed = false;
    });

    // Shuffle villager keys for randomness
    const shuffledKeys = [...villagerKeys].sort(() => Math.random() - 0.5);
    // Select however many villagers this run needs
    const selectedKeys = shuffledKeys.slice(0, gameState.villagersToHeal);

    // Mark selected villagers as active
    selectedKeys.forEach((key) => {
        gameState.villagers[key].active = true;
    });

    console.log("Active villagers for this run:", selectedKeys);
    console.log("Updated villager state:", gameState.villagers);
}

// GET ACTIVE VILLAGERS FOR TRAVELING/HEALING
function getActiveVillagerKeys() {
    return Object.keys(gameState.villagers).filter((key) => {
        return gameState.villagers[key].active === true;
    })
}

// ADD ACTIVE VILLAGERS TO VILLAGER TRAVEL LIST
function renderVillagerSelectList() {
    villagerSelectList.innerHTML = "";

    const activeVillagers = getActiveVillagerKeys();

    activeVillagers.forEach((villagerKey) => {
        const villagerBtn = document.createElement("button");
        villagerBtn.className = "villagerSelectBtn";
        villagerBtn.dataset.villager = villagerKey;
        villagerBtn.textContent = villagerDatabase[villagerKey].name;

        villagerSelectList.appendChild(villagerBtn);
    });
}

// ADD RATS TO TRAVEL LIST
function renderRatSelectList() {
    ratSelectList.innerHTML = "";

    Object.keys(gameState.rats).forEach((ratKey) => {
        const rat = gameState.rats[ratKey];

        if (rat.dead) return;

        const ratBtn = document.createElement("button");
        ratBtn.className = "ratSelectBtn";
        ratBtn.dataset.rat = ratKey;
        ratBtn.textContent = ratsDatabase[ratKey].name;

        ratSelectList.appendChild(ratBtn);
    })
}

// Open Objectives Panel
objectiveBtn.addEventListener("click", () => {
    objectivePanel.classList.toggle("open");
})

// Updates game objectives (Rats, Villagers)
function updateObjectivePanel() {
    const objectiveContent = document.getElementById("objectiveContent");
    let html = "";

    if (gameState.ratsToKill > 0) {
        html += `
        <div class="objectiveItem">
            <img src="images/misc-images/ratObjectiveIcon.png" class="objectiveIcon" alt="Rat objective icon">
            <span>Defeat ${gameState.ratsToKill} rats. Progress: ${gameState.ratsKilled}/${gameState.ratsToKill}</span>
        </div>
        `;
    }

    if (gameState.villagersToHeal > 0) {
        html += `
        <div class="objectiveItem">
            <img src="images/misc-images/villagersObjectiveIcon.png" class="objectiveIcon" alt="Villagers objective icon">
            <span>Heal ${gameState.villagersToHeal} villagers. Progress: ${gameState.villagersHealed}/${gameState.villagersToHeal}</span>
        </div>
        `;
    }

    if (html === "") {
        objectiveContent.textContent = "No active objectives.";
    } else {
        objectiveContent.innerHTML = html;
    }

    checkVillageSavedEnding();

}

// BUTTONS
// --------------------------------------
// Save/Load Buttons
saveLoadBtn.addEventListener("click", () => {
    saveLoadOverlay.classList.remove("hidden");
});

closeSaveLoadBtn.addEventListener("click", () => {
    saveLoadOverlay.classList.add("hidden");
});

saveLoadOverlay.addEventListener("click", (e) => {
    if (e.target === saveLoadOverlay) {
        saveLoadOverlay.classList.add("hidden");
    }
});

saveGameBtn.addEventListener("click", () => {
    console.log("Save button clicked");
    // Backend will add Save logic here
});

loadGameBtn.addEventListener("click", () => {
    console.log("Load button clicked");
    // Backend will add Load logic here
});


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
    hideItemDescription();
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

    if (targetScene === "villagerHealingScene") {
        renderVillagerSelectList();
        villagerSelectOverlay.classList.remove("hidden");
        travelPanel.classList.remove("open");
        return;
    }

    if (targetScene === "ratScene") {
        renderRatSelectList();
        ratSelectOverlay.classList.remove("hidden");
        travelPanel.classList.remove("open");
        return;
    }

    showScene(targetScene);
    travelPanel.classList.remove("open");
})

// Travel to villager homes
villagerSelectList.addEventListener("click", (e) => {
    if (!e.target.classList.contains("villagerSelectBtn")) return;

    currentVillagerKey = e.target.dataset.villager;
    villagerSelectOverlay.classList.add("hidden");

    setActiveVillager(currentVillagerKey);
    showScene("villagerHealingScene");

    console.log("Selected villager:", currentVillagerKey);
})

closeVillagerSelectBtn.addEventListener("click", () => {
    villagerSelectOverlay.classList.add("hidden");
})

// Travel to rats
ratSelectList.addEventListener("click", (e) => {
    if (!e.target.classList.contains("ratSelectBtn")) return;

    currentRatKey = e.target.dataset.rat;
    ratSelectOverlay.classList.add("hidden");

    setActiveRat(currentRatKey);
    showScene("ratScene");
});

closeRatSelectBtn.addEventListener("click", () => {
    ratSelectOverlay.classList.add("hidden");
});

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
            if (gameState.doctorInfection <= 0) {
                return { valid: false, message: "The Doctor is not infected." };
            }
            return { valid: true };

        case "reduceVillagerInfection":
            // Only works in context of Heal Villager Scene
            if (document.getElementById("villagerHealingScene").style.display !== "block") {
                return { valid: false, message: "Healing Tonic can only be used in the villager healing scene." };
            }

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

    gameState.doctorInfection -= reductionAmt;

    if (gameState.doctorInfection < 0) gameState.doctorInfection = 0;
    if (gameState.doctorInfection > 100) gameState.doctorInfection = 100;

    renderDoctorInfection();
    return true;
}

// applyReduceVillagerInfection - used by Healing Tonic, reduces villager's plague infection status
function applyReduceVillagerInfection(item) {

    const villagerSceneVisible = document.getElementById("villagerHealingScene").style.display === "block";

    if (!villagerSceneVisible) {
        alert("Healing Tonic can only be used to heal villagers.");
        return false;
    }

    const villager = getActiveVillager();

    if (!villager) {
        alert("No active villager found.");
        return false;
    }

    if (villager.dead) {
        alert("This villager is dead.");
        return false;
    }

    if (villager.healed) {
        alert("This villager has already been healed.")
        return false;
    }

    if (!canSpendActionToken(1)) {
        return false;
    }

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

    villager.infectionLevel -= reductionAmt;

    if (villager.infectionLevel <= 0) {
        villager.infectionLevel = 0;
        villager.healed = true;
        gameState.villagersHealed += 1;
    }

    spendActionToken(1);

    renderVillagerInfection();
    renderVillagerScene();
    updateVillageVisual();
    updateObjectivePanel();

    return true;
}

// applySuppressVillagerInfection - used by Fever Suppressant, keeps active villager infection from worsening at end of day. If it is
// brewed strong, it also reduces the villager's plague infection status slightly.
function applySuppressVillagerInfection(item) {
    const villagerSceneVisible = document.getElementById("villagerHealingScene").style.display === "block";

    if (!villagerSceneVisible) {
        alert("Fever Suppressant can only be used to heal villagers.")
        return false;
    }

    const villager = getActiveVillager();

    if (!villager) {
        alert("No active villager found.");
        return false;
    }

    if (villager.dead) {
        alert("This villager is dead.");
        return false;
    }

    if (villager.healed) {
        alert("This villager has already been healed.");
        return false;
    }

    if (villager.feverSuppressed) {
        alert("This villager is already protected for the night.");
        return false;
    }

    if (!canSpendActionToken(1)) {
        return false;
    }

    villager.feverSuppressed = true;

    if (item.tier === "mid") {
        villager.infectionLevel -= 5;
    } else if (item.tier === "strong") {
        villager.infectionLevel -= 10;
    }

    if (villager.infectionLevel <= 0) {
        villager.infectionLevel = 0;
        villager.healed = true;
        gameState.villagersHealed += 1;
    }

    spendActionToken(1);

    renderVillagerInfection();
    renderVillagerScene();
    updateVillageVisual();
    updateObjectivePanel();

    return true;
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
// ACTION TOKENS SYSTEM
// --------------------------------------------------------------

function renderActionTokens() {
    const actionTokensValue = document.getElementById("actionTokensValue");
    actionTokensValue.textContent = `${gameState.actionTokens} / ${gameState.maxActionTokens}`;
}

renderActionTokens();

// Spending Action Tokens
function spendActionToken(amount = 1) {
    if (gameState.actionTokens <= 0 || gameState.actionTokens < amount) {
        return false;
    }

    gameState.actionTokens -= amount;

    if (gameState.actionTokens < 0) {
        gameState.actionTokens = 0;
    }

    renderActionTokens();
    return true;
}

// Checks to see if user has enough Action Tokens for an action
function canSpendActionToken(amount = 1) {
    if (gameState.actionTokens < amount) {
        alert("No action tokens remaining. Return to the village to end the day.");
        return false;
    }

    return true;

}

// --------------------------------------------------------------
// DAYS SYSTEM
// --------------------------------------------------------------
function renderDay() {
    const dayValue = document.getElementById("dayValue");
    dayValue.textContent = `${gameState.day} / ${gameState.maxDays}`;
}

function advanceDay() {
    if (gameState.day < gameState.maxDays) {
        gameState.day += 1;
    }

    gameState.actionTokens = gameState.maxActionTokens;
    renderDay();
    renderActionTokens();

    if (typeof refreshShopInventory === "function") {
        refreshShopInventory();
    }
}

renderDay();

// --------------------------------------------------------------
// GAME ENDINGS
// --------------------------------------------------------------
// ENDING 1: Doctor Dies (Doctor infection reaches 100)
function triggerDoctorDiesEnding() {
    showScene("doctorDiesScene");
    startDoctorDiesScene();
}

// ENDING 2: Village Collapses (Final day is reached without meeting villagers & rats objectives)
function triggerVillageCollapseEnding() {
    showScene("villageCollapseScene");
    startVillageCollapseScene();
}

// ENDING 3: Village Saved (Rats & Villagers Objectives are met)
function triggerVillageSavedEnding() {
    showScene("villageSavedScene")
    startVillageSavedScene();
}

function checkVillageSavedEnding() {
    if (
        gameState.villagersHealed >= gameState.villagersToHeal &&
        gameState.ratsKilled >= gameState.ratsToKill &&
        gameState.villagersToHeal > 0 &&
        gameState.ratsToKill > 0
    ) {
        triggerVillageSavedEnding();
    }
}

// --------------------------------------------------------------
// END OF DAY REPORT
// --------------------------------------------------------------
let endOfDayProcessed = false;

// Check to see if Doctor has a specific item in inventory (used at end of day to check for herb satchel)
function hasItemInInventory(itemName) {
    return gameState.inventory.some(item => item.name === itemName);
}

// End of Day Updates (Infections increase, rats HP increase, donations/gifts applied, etc.)
function applyEndOfDayUpdates() {
    const report = {
        healedVillagers: gameState.villagersHealed,
        defeatedRats: gameState.ratsKilled,
        villagersWorsened: 0,
        ratsStrengthened: 0,
        doctorInfectionIncreased: false,
        moneyReceived: 0,
        giftedItems: []
    };

    // Rats that are still alive gain HP
    Object.values(gameState.rats).forEach(rat => {
        if (!rat.dead) {
            rat.hp += 10;
            if (rat.hp > 100) rat.hp = 100;
            report.ratsStrengthened += 1;
        }
    });

    // Villagers with active infections worsen 
    Object.values(gameState.villagers).forEach(villager => {
        if (villager.active && !villager.healed && !villager.dead) {
            // Skip infection increase if villager has Fever Suppressant or Ruby Amulet protection
            if (villager.feverSuppressed) {
                return;
            }

            villager.infectionLevel += 10;
            // TODO: Villager dies if infection level reaches 100
            if (villager.infectionLevel > 100) villager.infectionLevel = 100;
            report.villagersWorsened += 1;
        }
    });

    // Any applied fever suppressants wear off after End of Day
    Object.values(gameState.villagers).forEach(villager => {
        villager.feverSuppressed = false;
    })

    // Doctor infection increases unless Herb Satchel is in inventory
    if (!hasItemInInventory("Herb Satchel")) {
        gameState.doctorInfection += 10;
        if (gameState.doctorInfection > 100) gameState.doctorInfection = 100;
        report.doctorInfectionIncreased = true;
        renderDoctorInfection();
    }

    // Village Donations
    const rewardMoney = Math.floor(Math.random() * 451) + 50; // Change amount later if it needs to be more
    addMoney(rewardMoney);
    report.moneyReceived = rewardMoney;

    // Village Gifts
    const giftCount = Math.floor(Math.random() * 2) + 2 // 2-3 gift items
    const giftItems = getRandomStartItems(itemDatabase, giftCount);

    giftItems.forEach(item => {
        addItemToInventory(item);
        report.giftedItems.push(item.name);
    });

    // Refresh visuals after update
    updateVillageVisual();
    updateObjectivePanel();
    renderInventory();

    return report;
}

function buildEndOfDayReportText(report) {
    let text = `
        <p>You healed <strong>${report.healedVillagers}</strong> villagers.</p>
        <p>You defeated <strong>${report.defeatedRats}</strong> rats.</p>
        <p><strong>${report.ratsStrengthened}</strong> live rats grew stronger in the night.</p>
        <p><strong>${report.villagersWorsened}</strong> villagers worsened overnight.</p>
    `;

    if (report.doctorInfectionIncreased) {
        text += `<p>Your infection worsened during the night.</p>`;
    } else {
        text += `<p>Your herb satchel protected you through the night.</p>`;
    }

    text += `<p>The village gave you <strong>${report.moneyReceived}</strong> coins in thanks.</p>`;

    if (report.giftedItems.length > 0) {
        text += `<p>You also received some gifts: <strong>${report.giftedItems.join(", ")}</strong>.</p>`;
    }

    text += `<p>Rest tonight so you can be ready for tomorrow.</p>`;

    return text;
}

// End of Day Report
function showEndOfDayReport() {
    if (!endOfDayProcessed) {
        const report = applyEndOfDayUpdates();
        endOfDayText.innerHTML = buildEndOfDayReportText(report);
        endOfDayProcessed = true;
    }

    // If doctor infection is over 100, trigger doctor dies ending
    if (gameState.doctorInfection >= 100) {
        triggerDoctorDiesEnding();
        return;
    }

    endOfDayOverlay.classList.remove("hidden");
}

function hideEndOfDayReport() {
    endOfDayOverlay.classList.add("hidden");
}

// After closing End of Day report, the next 'Day' starts & Action Tokens are refreshed.
closeEndOfDayBtn.addEventListener("click", () => {
    hideEndOfDayReport();

    if (gameState.day >= gameState.maxDays) {
        if (
            gameState.villagersHealed >= gameState.villagersToHeal &&
            gameState.ratsKilled >= gameState.ratsToKill
        ) {
            triggerVillageSavedEnding();
        } else {
            triggerVillageCollapseEnding();
        }

        return;
    }

    advanceDay();
    endOfDayProcessed = false;
})

updateVillageVisual();
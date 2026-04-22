// MAIN JS FILE, SWITCHES TO OTHER JS FILES BASED ON SCENE CHANGE
// INITIALIZE HTML ELEMENTS
// -------------------------------------------------------------
// Characters
const villager1 = document.getElementById("villager1");
const worriedVillagerWoman = document.getElementById("worriedVillagerWoman");
const characterName = document.getElementById("characterName");

let currentVillagerKey = null;
// Controls current dialogue branch/scene state
window.sceneState = "intro";

// Main Menu, Arrival Scene, Start Game Button
const mainMenu = document.getElementById("mainMenu");
const arrivalScene = document.getElementById("arrivalScene");
const startGameBtn = document.getElementById("startGameBtn");

// Music Button
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");
bgm.load();

// Typing Sounds
const typeSounds = document.querySelectorAll(".typeSound");
let lastSoundIndex = -1;

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
const choiceBox = document.getElementById("choiceBox");
const choiceButtons = document.querySelectorAll(".choiceBtn");

// Dialogue Box and Text
const dialogueBox = document.getElementById("dialogueBox");
const dialogueText = document.getElementById("dialogueText");
const arrow = document.getElementById("nextArrow");

// Inventory
const inventoryBtn = document.getElementById("inventoryBtn");
const inventoryPanel = document.getElementById("inventoryPanel");
const inventoryHintArrow = document.getElementById("inventoryHintArrow");
const inventoryTabs = document.querySelectorAll(".inventoryTab");
let activeInventoryTab = "ingredients";
const menuHoverSound = new Audio("/static/sound-effects/misc-sounds/menu-hover.wav");

// Travel
const travelBtn = document.getElementById("travelBtn");
const travelPanel = document.getElementById("travelPanel");
const travelLocations = document.getElementById("travelLocations");

// Villager Selection Overlay
const villagerSelectOverlay = document.getElementById("villagerSelectOverlay");
const villagerSelectList = document.getElementById("villagerSelectList");
const closeVillagerSelectBtn = document.getElementById("closeVillagerSelectBtn");

// End of Day Overlay
const endOfDayOverlay = document.getElementById("endOfDayOverlay");
const closeEndOfDayBtn = document.getElementById("closeEndOfDayBtn");
const endOfDayText = document.getElementById("endOfDayText");

// Objectives
const objectiveBtn = document.getElementById("objectiveBtn");
const objectivePanel = document.getElementById("objectivePanel");

// Doctor Infection Status
window.doctorInfection = 50;

function renderDoctorInfection() {
    const bar = document.getElementById("doctorInfectionBar");
    const value = document.getElementById("doctorInfectionValue");

    bar.style.width = `${window.doctorInfection}%`;
    value.textContent = `${window.doctorInfection}%`;
}

renderDoctorInfection();

// TRANSITION FROM MENU SCENE TO ARRIVAL/INTRO SCENE
// ------------------------------------------------
// Login overlay elements
const loginOverlay = document.getElementById("loginOverlay");
const loginForm = document.getElementById("loginForm");
const loginCancel = document.getElementById("loginCancel");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const createAccount = document.getElementById("createAccount");
const guestLoginBtn = document.getElementById("guestLoginBtn");

if (!loginOverlay) console.error("Missing #loginOverlay");
if (!loginForm) console.error("Missing #loginForm");
if (!loginUsername) console.error("Missing #loginUsername");
if (!loginPassword) console.error("Missing #loginPassword");
if (!startGameBtn) console.error("Missing #startGameBtn");

function showLogin() {
    if (!loginOverlay) return;

    loginOverlay.classList.remove("hidden");
    loginOverlay.setAttribute("aria-hidden", "false");

    if (loginError) {
        loginError.textContent = "";
        loginError.style.display = "none";
    }

    if (loginUsername) loginUsername.value = "";
    if (loginPassword) loginPassword.value = "";

    loginUsername?.focus();
}

function hideLogin() {
    if (!loginOverlay) return;

    loginOverlay.classList.add("hidden");
    loginOverlay.setAttribute("aria-hidden", "true");
}

async function startGame() {
    showScene("arrivalScene");
    currentLine = 0;
    dialogueText.innerHTML = "";
    typeLine(dialogueLines[currentLine]);
}

startGameBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    showLogin();
});

loginCancel?.addEventListener("click", (e) => {
    e.preventDefault();
    hideLogin();
});

guestLoginBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
        });
    } catch (error) {
        console.error("Guest logout failed:", error);
    }

    hideLogin();
    await startGame();
});

loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = (loginUsername?.value || "").trim();
    const password = (loginPassword?.value || "").trim();
    const create = createAccount?.checked === true;

    if (!username || !password) {
        if (loginError) {
            loginError.textContent = "Enter username and password.";
            loginError.style.display = "block";
        }
        return;
    }

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            credentials: "same-origin",
            body: JSON.stringify({
                username,
                password,
                create,
            }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(data.error || `Login failed (${res.status})`);
        }

        hideLogin();

        if (create) {
            await startGame();
            return;
        }

        try {
            await loadGame();
        } catch (loadError) {
            console.warn("Load failed or no save exists, starting new game:", loadError);
            await startGame();
        }
    } catch (err) {
        console.error("Login failed:", err);

        if (loginError) {
            loginError.textContent = err?.message || "Login failed";
            loginError.style.display = "block";
        } else {
            alert(err?.message || "Login failed");
        }
    }
});

showScene("mainMenu");

startGameBtn?.addEventListener("mouseover", () => {
    menuHoverSound.play();
});

// DIALOGUE SYSTEM AND CHOICES
// -------------------------------------------------
arrow.addEventListener("click", nextDialogue);

// Keyboard Navigation
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();

        if (mainMenu.style.display === "none") {
            nextDialogue();
        }
    }

    if (e.key.toLowerCase() === "b") {
        previousDialogue();
    }
});

function previousDialogue() {
    if (isTyping) return;

    if (window.sceneState === "intro") {
        if (currentLine > 0) {
            currentLine--;
            typeLine(dialogueLines[currentLine]);
        }
    }
}

// Intro Scene Dialogue Lines
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

function nextDialogue() {
    if (isTyping) return;

    if (window.sceneState === "intro") {
        currentLine++;

        if (currentLine < dialogueLines.length) {
            typeLine(dialogueLines[currentLine]);
        } else {
            arrow.style.opacity = 0;
            choiceBox.style.display = "flex";
        }
    } else if (window.sceneState === "villagers") {
        arrow.style.opacity = 0;

        choiceBox.innerHTML = `
        <button class="choiceBtn" data-choice="heal-villager">Heal Villager in Home</button>
        <button class="choiceBtn" data-choice="chapel">Pray at Chapel</button>`;

        choiceBox.style.display = "flex";
    } else if (window.sceneState === "rats") {
        arrow.style.opacity = 0;

        choiceBox.innerHTML = `
        <button class="choiceBtn" data-choice="fight-rats">Fight Rats</button>
        <button class="choiceBtn" data-choice="shop">Shop for Defense</button>`;

        choiceBox.style.display = "flex";
    } else if (window.sceneState === "supplies") {
        arrow.style.opacity = 0;

        choiceBox.innerHTML = `
        <button class="choiceBtn" data-choice="forest">Search Forest for Ingredients</button>
        <button class="choiceBtn" data-choice="potions">Brew Potions</button>`;

        choiceBox.style.display = "flex";
    }
}

// Choice Navigation
choiceBox.addEventListener("click", (e) => {
    if (!e.target.classList.contains("choiceBtn")) return;

    const choice = e.target.dataset.choice;
    choiceBox.style.display = "none";

    if (choice === "villagers") {
        window.sceneState = "villagers";
        currentLine = 0;

        characterName.textContent = "Worried Wife:";

        villager1.style.opacity = 0;
        worriedVillagerWoman.style.opacity = 1;

        setTimeout(() => {
            typeLine("Doctor...my husband hasn't woken in two days...");
        }, 600);

        generateVillagersObjective();
        updateObjectivePanel();
    } else if (choice === "rats") {
        window.sceneState = "rats";
        currentLine = 0;

        typeLine("The rats are the plague itself. They scurry through our village, infecting our people. One bite can mean death...");
        generateRatObjective();
        updateObjectivePanel();
    } else if (choice === "supplies") {
        window.sceneState = "supplies";
        currentLine = 0;

        characterName.textContent = "";
        inventoryHintArrow.style.opacity = "1";

        setTimeout(() => {
            inventoryHintArrow.style.opacity = "0";
        }, 4000);

        typeLine(`You check your satchel. Your supplies are limited. To create cures, you must gather ingredients from the forest.
                Each potion requires careful preparation. Mistakes may cost lives -- including your own.`);

        giveRandomStartItems();
    } else if (choice === "heal-villager") {
        showScene("villagerHealingScene");
    } else if (choice === "chapel") {
        showScene("chapelScene");
    } else if (choice === "fight-rats") {
        showScene("ratScene");
    } else if (choice === "shop") {
        showScene("shopScene");
    } else if (choice === "forest") {
        showScene("forestScene");
    } else if (choice === "potions") {
        showScene("potionsScene");
    }
});

// SCENE SWITCHING FUNCTION
// --------------------------------------------------------------
function showScene(sceneID) {
    const scenes = document.querySelectorAll(".scene");

    scenes.forEach((scene) => {
        scene.style.display = "none";
    });

    document.getElementById(sceneID).style.display = "block";

    if (sceneID === "villagerHealingScene" && typeof renderVillagerInfection === "function") {
        renderVillagerInfection();
    }

    if (sceneID === "potionsScene") {
        bgm.src = "/static/audio/potionsMusic.mp3";
        bgm.load();
    } else if (sceneID === "shopScene") {
        bgm.src = "/static/audio/shopMusic.mp3";
        bgm.load();
    }
    if (sceneID === "arrivalScene" && gameState.actionTokens <= 0) {
        showEndOfDayReport();
    }
}

// Add items to inventory
function addItemToInventory(newItem) {
    const existingItem = window.inventory.find((item) => item.name === newItem.name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        window.inventory.push({
            ...newItem,
            quantity: 1
        });
    }

    renderInventory();
}

// Remove items from inventory
function removeItemFromInventory(itemToRemove) {
    const existingItem = window.inventory.find((item) => item.name === itemToRemove.name);

    if (!existingItem) return;

    existingItem.quantity -= 1;

    if (existingItem.quantity <= 0) {
        const itemIndex = window.inventory.findIndex((item) => item.name === itemToRemove.name);
        window.inventory.splice(itemIndex, 1);
    }

    renderInventory();
}

// WHEN PLAYER CHECKS MEDICAL SUPPLIES, RANDOM ITEMS ARE GENERATED
window.inventory = [];
window.startItemsGiven = false;

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

function giveRandomStartItems() {
    if (window.startItemsGiven) return;

    const startItems = getRandomStartItems(itemDatabase, 3);

    startItems.forEach((item) => {
        addItemToInventory(item);
    });

    window.startItemsGiven = true;
    renderInventory();
}

function renderInventory() {
    const inventoryItems = document.getElementById("inventoryItems");
    inventoryItems.innerHTML = "";

    const filteredItems = window.inventory.filter((item) => {
        if (activeInventoryTab === "ingredients") return item.category === "ingredient";
        if (activeInventoryTab === "charm") return item.category === "charm";
        if (activeInventoryTab === "potions") return item.category === "potion";
        return false;
    });

    filteredItems.forEach((item) => {
        const slot = document.createElement("div");
        slot.className = "inventorySlot";

        const img = document.createElement("img");
        img.src = item.img;
        img.className = "inventoryItem";
        img.title = item.name;

        if (item.boostType === "emerald") {
            img.classList.add("emerald-boosted");
        }

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

inventoryTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        inventoryTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        activeInventoryTab = tab.dataset.tab;
        renderInventory();
    });

    tab.addEventListener("mouseover", () => {
        menuHoverSound.play();
    });
});

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

// Randomly Generates # of Rats to Fight, # of Villagers to Heal
window.ratObjective = null;
window.ratsDefeated = 0;
window.villagersObjective = null;
window.villagersHealed = 0;

function generateRatObjective() {
    if (window.ratObjective !== null) return window.ratObjective;

    window.ratObjective = Math.floor(Math.random() * 5) + 3;
    return window.ratObjective;
}

function generateVillagersObjective() {
    if (window.villagersObjective !== null) return window.villagersObjective;

    window.villagersObjective = Math.floor(Math.random() * 4) + 3;
    return window.villagersObjective;
}

// Open Objectives Panel
objectiveBtn.addEventListener("click", () => {
    objectivePanel.classList.toggle("open");
});

// Updates game objectives
function updateObjectivePanel() {
    const objectiveContent = document.getElementById("objectiveContent");
    let content = "";

    if (window.ratObjective !== null) {
        content += `
        <div class="objectiveItem">
            <img src="/static/img/misc-images/ratObjectiveIcon.png" class="objectiveIcon" alt="Rat objective icon">
            <span>Defeat ${window.ratObjective} rats. Progress: ${window.ratsDefeated}/${window.ratObjective}</span>
        </div>
        `;
    }

    if (window.villagersObjective !== null) {
        content += `
        <div class="objectiveItem">
            <img src="/static/img/misc-images/villagersObjectiveIcon.png" class="objectiveIcon" alt="Villagers objective icon">
            <span>Heal ${window.villagersObjective} villagers. Progress: ${window.villagersHealed}/${window.villagersObjective}</span>
        </div>
        `;
    }

    objectiveContent.innerHTML = content || "<p>No objectives yet.</p>";
}

// BUTTONS
// --------------------------------------
musicBtn.addEventListener("click", () => {
    if (bgm.paused) {
        bgm.play();
        musicBtn.textContent = "Music Off";
    } else {
        bgm.pause();
        musicBtn.textContent = "Music On";
    }
});

inventoryBtn.addEventListener("click", () => {
    inventoryPanel.classList.toggle("open");
});

travelBtn.addEventListener("click", () => {
    travelPanel.classList.toggle("open");
});

travelLocations.addEventListener("click", (e) => {
    if (!e.target.classList.contains("travelLocationBtn")) return;

    const targetScene = e.target.dataset.scene;
    showScene(targetScene);
    travelPanel.classList.remove("open");
});

villagerSelectList.addEventListener("click", (e) => {
    if (!e.target.classList.contains("villagerSelectBtn")) return;

    currentVillagerKey = e.target.dataset.villager;
    villagerSelectOverlay.classList.add("hidden");

    setActiveVillager(currentVillagerKey);
    showScene("villagerHealingScene");
});

closeVillagerSelectBtn?.addEventListener("click", () => {
    villagerSelectOverlay.classList.add("hidden");
});

// ITEM USE FUNCTIONS
// --------------------------------------------------------------
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

function validateItemUse(item) {
    switch (item.effectType) {
        case "reduceDoctorInfection":
            if (window.doctorInfection <= 0) {
                return { valid: false, message: "The Doctor is not infected." };
            }
            return { valid: true };

        case "reduceVillagerInfection":
            if (document.getElementById("villagerHealingScene").style.display !== "block") {
                return { valid: false, message: "Healing Tonic can only be used in the villager healing scene." };
            }
            return { valid: true };

        case "suppressVillagerInfection":
            return { valid: true };

        case "poisonRat":
            return { valid: true };

        case "cureDoctorPoison":
            return { valid: true };

        default:
            return { valid: false, message: "This item cannot be used right now." };
    }
}

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

    window.doctorInfection -= reductionAmt;

    if (window.doctorInfection < 0) window.doctorInfection = 0;
    if (window.doctorInfection > 100) window.doctorInfection = 100;

    renderDoctorInfection();
    return true;
}

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
        alert("This villager has already been healed.");
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

    if (villager.infectionLevel < 0) {
        villager.infectionLevel = 0;
    }

    if (villager.infectionLevel === 0) {
        villager.healed = true;
        if (typeof window.villagersHealed === "number") {
            window.villagersHealed += 1;
        }
    }

    renderVillagerInfection();
    updateObjectivePanel();
    return true;
}

function applySuppressVillagerInfection(item) {
    alert("Fever Suppressant logic will connect to villager healing scene.");
    return false;
}

function applyPoisonRat(item) {
    alert("Plague Concoction logic will connect to rat encounter scene.");
    return false;
}

function applyCureDoctorPoison(item) {
    alert("Ash Remedy can be used by doctor in any scene.");
    return false;
}

// MONEY
// --------------------------------------------------------------
window.money = 0;

function renderMoney() {
    document.getElementById("moneyValue").textContent = window.money;
}

function addMoney(amount) {
    window.money += amount;
    renderMoney();
}

function spendMoney(amount) {
    if (window.money < amount) return false;
    window.money -= amount;
    renderMoney();
    return true;
}

function loseMoney(amount) {
    window.money -= amount;

    if (window.money < 0) {
        window.money = 0;
    }

    renderMoney();
}

function setRandomStartMoney() {
    window.money = Math.floor(Math.random() * 6) + 100;
    renderMoney();
}

setRandomStartMoney();

// VILLAGE INFECTION / VISUALS
// --------------------------------------------------------------
function getVillageInfectionPercent() {
    const villagerKeys = Object.keys(gameState.villagers);

    const activeVillagers = villagerKeys.filter((key) => {
        return gameState.villagers[key].active === true;
    });

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

function renderVillageInfection() {
    const bar = document.getElementById("villageInfectionBar");
    const value = document.getElementById("villageInfectionValue");

    const villageInfection = getVillageInfectionPercent();
    bar.style.width = `${villageInfection}%`;
    value.textContent = `${Math.round(villageInfection)}%`;
}

function updateVillageBackground() {
    const arrivalScene = document.getElementById("arrivalScene");
    const villageInfection = getVillageInfectionPercent();

    if (villageInfection < 30) {
        arrivalScene.style.backgroundImage = "url('/static/img/backgrounds/healthyVillage.png')";
    } else if (villageInfection <= 70) {
        arrivalScene.style.backgroundImage = "url('/static/img/backgrounds/midHealthVillage.png')";
    } else {
        arrivalScene.style.backgroundImage = "url('/static/img/backgrounds/toxicVillage.png')";
    }
}

function updateVillageVisual() {
    renderVillageInfection();
    updateVillageBackground();
}

// VILLAGER SELECTION
// --------------------------------------------------------------
function activateVillagersForRun() {
    const villagerKeys = Object.keys(gameState.villagers);
    const alreadyActive = villagerKeys.some((key) => gameState.villagers[key].active);

    if (alreadyActive) return;

    villagerKeys.forEach((key) => {
        gameState.villagers[key].active = false;
        gameState.villagers[key].healed = false;
        gameState.villagers[key].dead = false;
    });

    const shuffledKeys = [...villagerKeys].sort(() => Math.random() - 0.5);
    const selectedKeys = shuffledKeys.slice(0, gameState.villagersToHeal);

    selectedKeys.forEach((key) => {
        gameState.villagers[key].active = true;
    });
}

function getActiveVillagerKeys() {
    return Object.keys(gameState.villagers).filter((key) => gameState.villagers[key].active === true);
}

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

function setActiveVillager(villagerKey) {
    currentVillagerKey = villagerKey;
}

function getActiveVillager() {
    if (!currentVillagerKey) return null;
    return gameState.villagers[currentVillagerKey] || null;
}

// DAY / ACTION TOKEN SYSTEM
// --------------------------------------------------------------
function renderActionTokens() {
    const actionTokensValue = document.getElementById("actionTokensValue");
    actionTokensValue.textContent = `${gameState.actionTokens} / ${gameState.maxActionTokens}`;
}

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

function canSpendActionToken(amount = 1) {
    if (gameState.actionTokens < amount) {
        alert("No action tokens remaining. Return to the village to end the day.");
        return false;
    }

    return true;
}

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

// END OF DAY
// --------------------------------------------------------------
let endOfDayProcessed = false;

function hasItemInInventory(itemName) {
    return gameState.inventory.some(item => item.name === itemName);
}

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

    Object.values(gameState.rats).forEach(rat => {
        if (!rat.dead) {
            rat.hp += 10;
            if (rat.hp > 100) rat.hp = 100;
            report.ratsStrengthened += 1;
        }
    });

    Object.values(gameState.villagers).forEach(villager => {
        if (villager.active && !villager.healed && !villager.dead) {
            villager.infectionLevel += 10;
            if (villager.infectionLevel > 100) villager.infectionLevel = 100;
            report.villagersWorsened += 1;
        }
    });

    if (!hasItemInInventory("Herb Satchel")) {
        gameState.doctorInfection += 10;
        if (gameState.doctorInfection > 100) gameState.doctorInfection = 100;
        report.doctorInfectionIncreased = true;
        renderDoctorInfection();
    }

    const rewardMoney = Math.floor(Math.random() * 451) + 50;
    addMoney(rewardMoney);
    report.moneyReceived = rewardMoney;

    const giftCount = Math.floor(Math.random() * 2) + 2;
    const giftItems = getRandomStartItems(itemDatabase, giftCount);

    giftItems.forEach(item => {
        addItemToInventory(item);
        report.giftedItems.push(item.name);
    });

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

function showEndOfDayReport() {
    if (!endOfDayProcessed) {
        const report = applyEndOfDayUpdates();
        endOfDayText.innerHTML = buildEndOfDayReportText(report);
        endOfDayProcessed = true;
    }

    endOfDayOverlay.classList.remove("hidden");
}

function hideEndOfDayReport() {
    endOfDayOverlay.classList.add("hidden");
}

closeEndOfDayBtn?.addEventListener("click", () => {
    hideEndOfDayReport();

    if (gameState.day >= gameState.maxDays) {
        alert("Final day reached.");
    }
})


// Expose functions for save/load integration
window.showScene = showScene;
window.renderMoney = renderMoney;
window.renderInventory = renderInventory;
window.renderDoctorInfection = renderDoctorInfection;
window.updateObjectivePanel = updateObjectivePanel;
window.startGame = startGame;
window.showLogin = showLogin;
window.hideLogin = hideLogin;
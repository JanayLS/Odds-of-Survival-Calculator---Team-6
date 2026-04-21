// Grabs the scene element from our main HTML document
const ratScene = document.getElementById("ratScene");

// ADD YOUR SCENE'S HTML CODE INSIDE THE INNERHTML TEMPLATE LITERAL BELOW
ratScene.innerHTML = `
    <img id="ratDoctor" src="images/characters/plagueDoctor.png" alt="Plague Doctor image">

    <img id="ratImage" src="" alt="Rat image">

    <div id="ratDialogueBox">
        <div id="ratSpeakerName">Rat:</div>
        <div id="ratDialogueText">Fight scene</div>
        <div id="ratActionBox" class="fightChoiceBox"></div>
        <div id="ratNextArrow">➤</div>
    </div>

    <div id="ratHpUI">
        <div id="ratHpLabel">Rat HP</div>

        <div id="ratHpContainer">
            <div id="ratHpBar"></div>
        </div>

        <div id="ratHpValue">100 / 100</div>
    </div>

    <div id="ratLootPopup">
        <h2>You Found</h2>
        <div id="ratLootItems"></div>
        <button id="ratClosePopupBtn">Continue</button>
    </div>
`

// ADD SCENE SPECIFIC JS HERE -- Do not redeclare global variables/functions that are already in script.js
// If needed, rename your local variables to avoid conflicts with script.js
let activeRatKey = null;
const ratHpUI = document.getElementById("ratHpUI");
const ratActionBox = document.getElementById("ratActionBox");
const ratSpeakerName = document.getElementById("ratSpeakerName");
const ratDialogueText = document.getElementById("ratDialogueText");
const ratNextArrow = document.getElementById("ratNextArrow");
const ratLootPopup = document.getElementById("ratLootPopup");
const ratLootItems = document.getElementById("ratLootItems");
const ratClosePopupBtn = document.getElementById("ratClosePopupBtn");
const ratTravelBtn = document.getElementById("travelBtn");
const ratTravelPanel = document.getElementById("travelPanel");

function lockTravelDuringRatBattle() {
    if (!ratTravelBtn) return;

    ratTravelBtn.disabled = true;
    ratTravelBtn.classList.add("travelLocked");

    if (ratTravelPanel) {
        ratTravelPanel.classList.remove("open");
        ratTravelPanel.style.pointerEvents = "none";
    }
}

function unlockTravelAfterRatBattle() {
    if (!ratTravelBtn) return;

    ratTravelBtn.disabled = false;
    ratTravelBtn.classList.remove("travelLocked");

    if (ratTravelPanel) {
        ratTravelPanel.style.pointerEvents = "auto";
    }
}

function getActiveRatState() {
    return activeRatKey ? gameState.rats[activeRatKey] : null;
}

const ratDialogueByRat = {
    rat1: [
        "Watch out villager! There's a pesky rat by that shack.",
        "It's bee-lining straight toward us!",
        "Screeeeeeee!",
        "The diseased rat bares its filthy stinky teeth.",
        "It lunges forward! Just after the villager moved out of the way."
    ],
    rat2: [
        "Thats a rare sight! A corn rat... these things are impossible to spot at night.",
        "They blend in too well with the fields... the stalks... the shadows.",
        "Just before dark, they come out to feed.",
        "You can only ever catch a glimpse of them like this.",
        "...Rustling in the cornfields...",
        "...There. Movement again. You're not as hidden as you think.",
        "...Krrrk... human...",
        "I will make you freeze like the scarecrows in these fields.",
        "Freeze from having no life.",
        "It looks like your appearance leaves me no choice..."
    ],
    rat3: [
        "...Strange. You're alone.",
        "Yeah? And?",
        "No crew. No escorts. No swarm of shadows at your back... That kind is the hardest to fight.",
        "Hah... you think I need 'em?",
        "When they move as a group, they're chaos given form. Impossible to track, impossible to isolate... a sickness that spreads before you even see the symptoms.",
        "Sounds like you're scared of numbers, doc.",
        "I'm cautious of patterns. And yours is... unusual.",
        "I left the boys behind. Didn't need 'em for a stroll through your little plague town.",
        "Overconfidence is often the first symptom.",
        "And what's yours?",
        "Preparation."
    ],
    rat4: [
        "Welcome, Doctor. It's not much, but I hope you can find what you need.",
        "I'll take a look. What do you have?",
        "Fresh herbs, remedies... all fairly priced.",
        "...Since when did you grow whiskers?",
        "What are you talking about?",
        "Wait a minute... you aren't Rosemary.",
        "You're a filthy critter!"
    ],
    rat5: [
        "Bell tower rat… what are you doing up here?",
        "I was looking for a new home to put above my head.",
        "That… is not what I meant.",
        "Heh… It fits, does it not? High above the rot… where the sound carries.",
        "You’ve turned a place of warning into something… else.",
        "Oh, no, doctor… I perfected it.",
        "Every ring… a message. Every echo… a summons.",
        "You’re calling them.",
        "I am guiding them.",
        "The lost, the sick, the crawling things below… they hear me.",
        "And they answer.",
        "Always.",
        "This tower was meant to protect the village.",
        "And now it protects me."
    ]
};

const ratSpeakerByRat = {
    rat1: [
        "Plague Doctor:",
        "Plague Doctor:",
        "Diseased Rat:",
        "Narrator:",
        "Narrator:"
    ],
    rat2: [
        "Plague Doctor:",
        "Plague Doctor:",
        "Plague Doctor:",
        "Plague Doctor:",
        "Narrator:",
        "Plague Doctor:",
        "Corn Rat:",
        "Corn Rat:",
        "Corn Rat:",
        "Plague Doctor:"
    ],
    rat3: [
        "Plague Doctor:",
        "Mafia Rat:",
        "Plague Doctor:",
        "Mafia Rat:",
        "Plague Doctor:",
        "Mafia Rat:",
        "Plague Doctor:",
        "Mafia Rat:",
        "Plague Doctor:",
        "Mafia Rat:",
        "Plague Doctor:"
    ],
    rat4: [
        "Rosemary Rat:",
        "Plague Doctor:",
        "Rosemary Rat:",
        "Plague Doctor:",
        "Rosemary Rat:",
        "Plague Doctor:",
        "Plague Doctor:"
    ],
    rat5: [
        "Plague Doctor:",
        "Bell Tower Rat:",
        "Plague Doctor:",
        "Bell Tower Rat:",
        "Plague Doctor:",
        "Bell Tower Rat:",
        "Bell Tower Rat:",
        "Plague Doctor:",
        "Bell Tower Rat:",
        "Bell Tower Rat:",
        "Plague Doctor:",
        "Bell Tower Rat:",
        "Plague Doctor:",
        "Bell Tower Rat:"
    ]
};

let ratCurrentDialogue = [];
let ratCurrentLine = 0;
let ratIsTyping = false;
let ratTypingInterval = null;
let ratLootPopupOpen = false;
let ratHideNextArrow = false;

const ratHerbLootPool = [
    "silverleaf",
    "yarrow",
    "thyme",
    "mint"
];

function getRatSpeakerForLine(lineIndex) {
    const customSpeakers = ratSpeakerByRat[activeRatKey];
    if (customSpeakers && customSpeakers[lineIndex]) {
        return customSpeakers[lineIndex];
    }

    return "Diseased Rat:";
}

function renderRatPrompt() {
    ratCurrentDialogue = ratDialogueByRat[activeRatKey] || ["dialogue"];
    ratCurrentLine = 0;

    const activeRatState = getActiveRatState();

    if (activeRatState && activeRatState.introSeen === true) {
        ratCurrentDialogue = [];
        showRatActionChoices();
        return;
    }

    if (ratSpeakerName) {
        ratSpeakerName.textContent = getRatSpeakerForLine(ratCurrentLine);
    }

    if (ratDialogueText) {
        typeRatLine(ratCurrentDialogue[ratCurrentLine]);
    }

    if (ratActionBox) {
        ratActionBox.style.display = "none";
    }

    if (ratNextArrow) {
        ratNextArrow.style.opacity = 0;
    }
}

function showRatActionChoices() {
    if (!ratActionBox) return;

    const activeRatState = getActiveRatState();
    if (activeRatState) {
        activeRatState.introSeen = true;
    }

    ratActionBox.innerHTML = `
        <button class="choiceBtn" data-choice="run">Run away</button>
        <button class="choiceBtn" data-choice="scare">Scare him</button>
        <button class="choiceBtn" data-choice="fight">FIGHT!</button>
    `;

    ratActionBox.style.display = "grid";

    if (ratSpeakerName) {
        ratSpeakerName.textContent = "Narrator:";
    }

    if (ratDialogueText) {
        ratDialogueText.textContent = "The fight begins.";
    }

    if (ratNextArrow) {
        ratNextArrow.style.opacity = 0;
    }
}

function advanceRatDialogue() {
    if (ratIsTyping) return;

    if (ratCurrentLine < ratCurrentDialogue.length - 1) {
        ratCurrentLine += 1;
        if (ratSpeakerName) {
            ratSpeakerName.textContent = getRatSpeakerForLine(ratCurrentLine);
        }
        typeRatLine(ratCurrentDialogue[ratCurrentLine]);
        return;
    }

    showRatActionChoices();
}

function typeRatLine(line) {
    clearInterval(ratTypingInterval);
    ratIsTyping = true;
    ratDialogueText.textContent = "";

    if (ratNextArrow) {
        ratNextArrow.style.opacity = 0;
    }

    const effectiveTypingSpeed = typeof typingSpeed === "number" ? typingSpeed : 40;
    let i = 0;

    ratTypingInterval = setInterval(() => {
        const char = line.charAt(i);
        ratDialogueText.textContent += char;

        if (char && typeof playRandomTypeSound === "function") {
            playRandomTypeSound();
        }

        i += 1;

        if (i >= line.length) {
            clearInterval(ratTypingInterval);
            ratIsTyping = false;

            if (ratNextArrow && !ratHideNextArrow) {
                ratNextArrow.style.opacity = 1;
            }
        }
    }, effectiveTypingSpeed);
}

function getRandomRatHerbKey() {
    const randomIndex = Math.floor(Math.random() * ratHerbLootPool.length);
    return ratHerbLootPool[randomIndex];
}

function getRandomRatHerbCount() {
    return Math.floor(Math.random() * 3) + 1;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomRatGoldReward() {
    return getRandomIntInclusive(50, 150);
}

function addDoctorInfection(amount) {
    gameState.doctorInfection += amount;
    if (gameState.doctorInfection > 100) {
        gameState.doctorInfection = 100;
    }

    if (typeof renderDoctorInfection === "function") {
        renderDoctorInfection();
    }
}

function gatherRatHerbs() {
    const foundItems = [];
    const totalFinds = getRandomRatHerbCount();

    for (let i = 0; i < totalFinds; i++) {
        const itemKey = getRandomRatHerbKey();

        if (itemDatabase[itemKey]) {
            const item = itemDatabase[itemKey];
            foundItems.push(item);
            addItemToInventory(item);
        }
    }

    return foundItems;
}

function showRatLootPopup(foundItems, headerText = "You Found", emptyMessage = "The rat fled, but dropped nothing useful.") {
    const header = ratLootPopup.querySelector("h2");
    if (header) {
        header.textContent = headerText;
    }

    ratLootItems.innerHTML = "";

    if (foundItems.length === 0) {
        ratLootItems.innerHTML = `<p>${emptyMessage}</p>`;
    } else {
        foundItems.forEach((item) => {
            const card = document.createElement("div");
            card.className = "ratLootCard";

            const img = document.createElement("img");
            img.src = item.img;
            img.alt = item.name;

            const label = document.createElement("p");
            label.textContent = item.name;

            card.appendChild(img);
            card.appendChild(label);
            ratLootItems.appendChild(card);
        });
    }

    ratLootPopup.style.display = "block";
    ratLootPopupOpen = true;

    // Lock encounter choices while loot popup is active.
    ratActionBox.style.pointerEvents = "none";
}

function resetRatEncounterUiState() {
    ratLootPopupOpen = false;
    ratHideNextArrow = false;

    if (ratLootPopup) {
        ratLootPopup.style.display = "none";
    }

    if (ratActionBox) {
        ratActionBox.style.pointerEvents = "auto";
    }
}

function resolveRatSceneExit() {
    resetRatEncounterUiState();
    unlockTravelAfterRatBattle();

    if (gameState.doctorInfection >= 100) {
        if (typeof triggerDoctorDiesEnding === "function") {
            triggerDoctorDiesEnding();
        } else {
            showScene("doctorDiesScene");
        }
        return;
    }

    if (gameState.actionTokens <= 0) {
        showScene("arrivalScene");
        showEndOfDayReport();
        return;
    }

    showScene("arrivalScene");
}

function returnToArrivalOrEndDay() {
    resolveRatSceneExit();
}

function handleRatActionChoice(choice) {
    if (ratLootPopupOpen) return;

    if (gameState.actionTokens <= 0) {
        resolveRatSceneExit();
        return;
    }

    if (gameState.doctorInfection >= 100) {
        resolveRatSceneExit();
        return;
    }

    if (choice === "fight") {
        attackActiveRat();
        return;
    }

    if (choice === "run") {
        if (!canSpendActionToken(1)) return;
        spendActionToken(1);

        const runFailed = Math.random() < 0.5;

        if (runFailed) {
            ratSpeakerName.textContent = "Narrator:";
            ratDialogueText.textContent = "You failed to escape!";

            if (gameState.actionTokens <= 0) {
                ratActionBox.style.pointerEvents = "none";
                setTimeout(() => {
                    resolveRatSceneExit();
                }, 1500);
            }

            return;
        }

        
        const itemsDropped = [];
        const totalDrops = getRandomRatHerbCount(); // 1-3 items

        for (let i = 0; i < totalDrops; i++) {
            if (gameState.inventory.length === 0) break;

            const randomIndex = Math.floor(Math.random() * gameState.inventory.length);
            const droppedItem = gameState.inventory[randomIndex];
            itemsDropped.push(droppedItem); 
            removeItemFromInventory(droppedItem);
        }

        ratSpeakerName.textContent = "Narrator:";
        const itemNames = itemsDropped.map((item) => item.name);

        if (itemNames.length > 0) {
            const escapeMessage = `You escaped! But you dropped: ${itemNames.join(", ")}.`;
            ratHideNextArrow = true;
            typeRatLine(escapeMessage);
        } else {
            ratHideNextArrow = true;
            typeRatLine("You managed to escape!");
        }

      
        ratActionBox.style.pointerEvents = "none";
        ratLootPopupOpen = true;

      
        showRatLootPopup(itemsDropped, "You Lost", "You dropped nothing.");
        return;
    }

    if (choice === "scare") {
        if (!canSpendActionToken(1)) return;
        spendActionToken(1);

        let scareInfectionGain = 0;
        const scareInfectionRoll = Math.random() < 0.3;

        if (scareInfectionRoll) {
            scareInfectionGain = getRandomIntInclusive(8, 16);
            addDoctorInfection(scareInfectionGain);
        }

        const scareWorked = Math.random() < 0.5;

        if (!scareWorked) {
            ratSpeakerName.textContent = "Narrator:";
            const failLine = scareInfectionGain > 0
                ? `The rat was not scared. You gained ${scareInfectionGain}% infection.`
                : "The rat was not scared.";
            typeRatLine(failLine);

            if (gameState.actionTokens <= 0 || gameState.doctorInfection >= 100) {
                ratActionBox.style.pointerEvents = "none";
                setTimeout(() => {
                    resolveRatSceneExit();
                }, 1500);
            }

            return;
        }

        const foundItems = gatherRatHerbs();
        const herbNames = foundItems.map((item) => item.name);

        ratSpeakerName.textContent = "Narrator:";

        if (herbNames.length > 0) {
            const successLine = scareInfectionGain > 0
                ? `The rat flees and drops herbs: ${herbNames.join(", ")}. You gained ${scareInfectionGain}% infection.`
                : `The rat flees and drops herbs: ${herbNames.join(", ")}.`;
            typeRatLine(successLine);
        } else {
            const noLootLine = scareInfectionGain > 0
                ? `The rat flees, but drops nothing useful. You gained ${scareInfectionGain}% infection.`
                : "The rat flees, but drops nothing useful.";
            typeRatLine(noLootLine);
        }

        showRatLootPopup(foundItems);
    }
}

function setActiveRat(ratKey) {
    activeRatKey = ratKey;
    ratScene.dataset.activeRat = ratKey;
    resetRatEncounterUiState();
    lockTravelDuringRatBattle();
    renderRatScene();
    renderRatHp();
    renderRatPrompt();
    ratHpUI.style.display = "block";
}

function getActiveRat() {
    return gameState.rats[activeRatKey];
}

function renderRatHp() {
    const rat = getActiveRat();
    const bar = document.getElementById("ratHpBar");
    const value = document.getElementById("ratHpValue");

    if (!rat || !bar || !value) return;

    const maxHp = 100;
    bar.style.width = `${rat.hp}%`;
    value.textContent = `${rat.hp} / ${maxHp}`;
}

function renderRatScene() {
    if (!activeRatKey) return;

    const ratData = ratsDatabase[activeRatKey];
    const ratState = gameState.rats[activeRatKey];
    const portrait = document.getElementById("ratImage");

    if (!ratData || !ratState || !portrait) return;

    ratScene.style.backgroundImage = `url('${ratData.bg}')`;
    portrait.src = ratData.img;
}

function getPlagueConcoctionFromInventory() {
    return gameState.inventory.find((item) => {
        return item.category === "potion" && item.family === "plagueConcoction";
    }) || null;
}

function getPlagueConcoctionMultiplier(item) {
    if (item.tier === "weak") {
        return 1.6 + Math.random() * 0.4;
    }

    if (item.tier === "mid") {
        return 1.8 + Math.random() * 0.4;
    }

    if (item.tier === "strong") {
        return 2.0 + Math.random() * 1.0;
    }

    return null;
}

function isValidPlagueConcoctionTier(item) {
    return item.tier === "weak" || item.tier === "mid" || item.tier === "strong";
}

function attackActiveRat() {
    const rat = getActiveRat();

    if (!rat || rat.dead) return;

    if (gameState.doctorInfection >= 100) {
        resolveRatSceneExit();
        return;
    }

    if (!canSpendActionToken(1)) return;
    spendActionToken(1);

    let damage = Math.floor(Math.random() * 21) + 10;

    const plagueConcoction = getPlagueConcoctionFromInventory();

    if (plagueConcoction) {
        if (isValidPlagueConcoctionTier(plagueConcoction)) {
            const multiplier = getPlagueConcoctionMultiplier(plagueConcoction);
            damage = Math.round(damage * multiplier);
            removeItemFromInventory(plagueConcoction);
        }
    }

    rat.hp -= damage;

    let fightInfectionGain = 0;
    const fightInfectionRoll = Math.random() < 0.5;

    if (fightInfectionRoll) {
        fightInfectionGain = getRandomIntInclusive(10, 20);
        addDoctorInfection(fightInfectionGain);
    }

    if (gameState.doctorInfection >= 100) {
        resolveRatSceneExit();
        return;
    }

    if (rat.hp <= 0) {
        rat.hp = 0;
        rat.dead = true;
        gameState.ratsKilled += 1;
        renderRatSelectList();
        updateObjectivePanel();
        const goldReward = getRandomRatGoldReward();
        addMoney(goldReward);

        ratSpeakerName.textContent = "Narrator:";
        if (fightInfectionGain > 0) {
            ratDialogueText.textContent = `Rat defeated! You gained ${fightInfectionGain}% infection and looted ${goldReward} gold.`;
        } else {
            ratDialogueText.textContent = `Rat defeated! You looted ${goldReward} gold.`;
        }

        const goldRewardItem = {
            img: "images/misc-images/coin.png",
            name: `${goldReward} Gold`
        };

        showRatLootPopup([goldRewardItem], "You Found");
    } else if (fightInfectionGain > 0) {
        ratSpeakerName.textContent = "Narrator:";
        ratDialogueText.textContent = `The rat fights back. You gained ${fightInfectionGain}% infection.`;
    }

    renderRatHp();

    
    if (!rat.dead && gameState.actionTokens <= 0) {
        ratActionBox.style.pointerEvents = "none";
        setTimeout(() => {
            resolveRatSceneExit();
        }, 700);
    }
}

if (ratActionBox) {
    ratActionBox.addEventListener("click", (e) => {
        if (ratLootPopupOpen) return;
        if (!e.target.classList.contains("choiceBtn")) return;
        handleRatActionChoice(e.target.dataset.choice);
    });
}

if (ratNextArrow) {
    ratNextArrow.addEventListener("click", () => {
        advanceRatDialogue();
    });
}

document.addEventListener("keydown", (e) => {
    if (e.code !== "Space") return;

    const ratSceneVisible = ratScene.style.display === "block";
    if (!ratSceneVisible) return;

    const choicesAlreadyVisible = ratActionBox.style.display === "grid";
    if (choicesAlreadyVisible) return;

    advanceRatDialogue();
});

if (ratClosePopupBtn) {
    ratClosePopupBtn.addEventListener("click", () => {
        unlockTravelAfterRatBattle();
        returnToArrivalOrEndDay();
    });
}

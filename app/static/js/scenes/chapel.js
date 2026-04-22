// Grabs the scene element from our main HTML document

// ADD YOUR SCENE'S HTML CODE INSIDE THE INNERHTML TEMPLATE LITERAL BELOW

// ADD SCENE SPECIFIC JS HERE -- Do not redeclare global variables/functions that are already in script.js
// If needed, rename your local variables to avoid conflicts with script.js

// Remember to go to index.html, scroll to the bottom and add a <script> element linking to this scene's js file
// (Keep the JS script element underneath the data/items.js and script.js elements so they load first)



// Grabs the scene element from our main HTML document
const chapelScene = document.getElementById("chapelScene");

// ADD YOUR SCENE'S HTML CODE INSIDE THE INNERHTML TEMPLATE LITERAL BELOW
chapelScene.innerHTML = `
    <img id="chapelBackground" src="/static/img/backgrounds/chapel-background.png" alt="Chapel Background">

    <img id="chapelDoctor" src="/static/img/characters/plagueDoctor1.png" alt="Plague Doctor">

    <img id="chapelOldMan" class="chapelCharacter" src="/static/img/characters/OldManVillagerConcerned.png" alt="Old Villager">
    <img id="chapelWoman1" class="chapelCharacter" src="/static/img/characters/WomanVillagerConcerned1.png" alt="Worried Woman">
    <img id="chapelWoman2" class="chapelCharacter" src="/static/img/characters/WomanVillagerConcerened2.png" alt="Frightened Villager">

    <div id="chapelDialogueBox">
        <div id="chapelCharacterName">Narrator</div>
        <div id="chapelDialogueText"></div>

        <div id="chapelChoiceBox">
            <button class="chapelChoiceBtn" data-choice="pray-dead">Pray for the Dead</button>
            <button class="chapelChoiceBtn" data-choice="pray-living">Pray for the Living</button>
            <button class="chapelChoiceBtn" data-choice="leave">Leave chapel</button>
        </div>

        <div id="chapelNextArrow">➤</div>
    </div>

    <div id="chapelReflectionTimerBox">
        <div id="chapelReflectionTimerText">Reflecting... 5s</div>
    </div>

    <div id="chapelEffectPopup">
        <div id="chapelEffectPopupTitle">Chapel Effect</div>
        <div id="chapelEffectPopupText"></div>
        <button id="chapelCloseEffectPopupBtn">Continue</button>
        <button id="chapelLeaveChapelBtn">Return to Village</button>
    </div>
`;

// ADD SCENE SPECIFIC JS HERE -- Do not redeclare global variables/functions that are already in script.js
// If needed, rename your local variables to avoid conflicts with script.js

const chapelBackground = chapelScene.querySelector("#chapelBackground");
const chapelDoctor = chapelScene.querySelector("#chapelDoctor");
const chapelOldMan = chapelScene.querySelector("#chapelOldMan");
const chapelWoman1 = chapelScene.querySelector("#chapelWoman1");
const chapelWoman2 = chapelScene.querySelector("#chapelWoman2");

const chapelCharacterName = chapelScene.querySelector("#chapelCharacterName");
const chapelDialogueText = chapelScene.querySelector("#chapelDialogueText");
const chapelChoiceBox = chapelScene.querySelector("#chapelChoiceBox");
const chapelNextArrow = chapelScene.querySelector("#chapelNextArrow");

const chapelEffectPopup = chapelScene.querySelector("#chapelEffectPopup");
const chapelEffectPopupText = chapelScene.querySelector("#chapelEffectPopupText");
const chapelCloseEffectPopupBtn = chapelScene.querySelector("#chapelCloseEffectPopupBtn");
const chapelLeaveChapelBtn = chapelScene.querySelector("#chapelLeaveChapelBtn");

const chapelReflectionTimerBox = chapelScene.querySelector("#chapelReflectionTimerBox");
const chapelReflectionTimerText = chapelScene.querySelector("#chapelReflectionTimerText");

const chapelButtons = chapelScene.querySelectorAll(".chapelChoiceBtn");

let chapelDialogueIndex = 0;
let chapelDialogueLines = [];
let chapelIsTyping = false;
let chapelTypingInterval = null;
let chapelActionCompleted = false;
let chapelChosenVillager = null;

function setChapelDoctor(stage) {
    if (stage === "entrance") {
        chapelDoctor.src = "/static/img/characters/plagueDoctor1.png";
        chapelDoctor.className = "chapelDoctorEntrance";
    } else if (stage === "talking") {
        chapelDoctor.src = "/static/img/characters/plagueDoctor2.png";
        chapelDoctor.className = "chapelDoctorTalking";
    } else if (stage === "center") {
        chapelDoctor.src = "/static/img/characters/plagueDoctor3.png";
        chapelDoctor.className = "chapelDoctorCenter";
    }
}

function hideChapelVillagers() {
    chapelOldMan.style.display = "none";
    chapelWoman1.style.display = "none";
    chapelWoman2.style.display = "none";
}

function showChapelSpeaker(id) {
    hideChapelVillagers();

    if (id === "oldMan") chapelOldMan.style.display = "block";
    if (id === "woman1") chapelWoman1.style.display = "block";
    if (id === "woman2") chapelWoman2.style.display = "block";
}

const chapelVillagers = [
    {
        speaker: "Old Villager",
        id: "oldMan",
        lines: [
            "Doctor... thank the heavens you came.",
            "Each night more people fall ill.",
            "The rats grow bolder and people whisper the village is cursed.",
            "Tell me, Doctor... is there still hope for us?"
        ]
    },
    {
        speaker: "Worried Woman",
        id: "woman1",
        lines: [
            "My sister began coughing yesterday.",
            "We listen to every breath she takes.",
            "Another home sealed its doors this morning.",
            "Please tell us there is still something we can do."
        ]
    },
    {
        speaker: "Frightened Villager",
        id: "woman2",
        lines: [
            "The panic grows worse every day.",
            "No one trusts their neighbors anymore.",
            "People are too afraid to help the sick.",
            "If this continues, the village will tear itself apart."
        ]
    }
];

function buildChapelDialogue() {
    chapelChosenVillager = chapelVillagers[Math.floor(Math.random() * chapelVillagers.length)];

    chapelDialogueLines = [
        { speaker: "Narrator", id: null, text: "You enter the quiet chapel where villagers have gathered." },
        { speaker: "Narrator", id: null, text: "Fear hangs in the air as candlelight flickers across the walls." },
        { speaker: "Narrator", id: null, text: "You sit among them as the room grows silent." },
        { speaker: chapelChosenVillager.speaker, id: chapelChosenVillager.id, text: chapelChosenVillager.lines[0] },
        { speaker: chapelChosenVillager.speaker, id: chapelChosenVillager.id, text: chapelChosenVillager.lines[1] },
        { speaker: chapelChosenVillager.speaker, id: chapelChosenVillager.id, text: chapelChosenVillager.lines[2] },
        { speaker: chapelChosenVillager.speaker, id: chapelChosenVillager.id, text: chapelChosenVillager.lines[3] },
        { speaker: "Narrator", id: null, text: "For a brief moment, the chapel feels calmer than before." },
        { speaker: "Narrator", id: null, text: "What will you do?" }
    ];
}

function typeChapelLine(text) {
    clearInterval(chapelTypingInterval);
    chapelIsTyping = true;
    chapelDialogueText.textContent = "";
    chapelNextArrow.style.opacity = 0;

    let i = 0;
    chapelTypingInterval = setInterval(() => {
        chapelDialogueText.textContent += text.charAt(i);
        i++;

        if (i >= text.length) {
            clearInterval(chapelTypingInterval);
            chapelIsTyping = false;

            if (chapelDialogueIndex < chapelDialogueLines.length - 1) {
                chapelNextArrow.style.opacity = 1;
            } else {
                chapelNextArrow.style.opacity = 0;
                if (!chapelActionCompleted) {
                    chapelChoiceBox.style.display = "flex";
                }
            }
        }
    }, 25);
}

function showChapelDialogue() {
    const line = chapelDialogueLines[chapelDialogueIndex];

    chapelCharacterName.textContent = line.speaker;
    showChapelSpeaker(line.id);

    if (chapelDialogueIndex <= 2) {
        setChapelDoctor("entrance");
    } else {
        setChapelDoctor("talking");
    }

    typeChapelLine(line.text);
}

function showChapelEffectPopup(text) {
    chapelEffectPopupText.textContent = text;
    chapelEffectPopup.style.display = "block";
    chapelCloseEffectPopupBtn.style.display = "inline-block";
    chapelLeaveChapelBtn.style.display = "none";
}

// Get which villagers are sick or dead, & check if player has prayer charm items in inventory
function hasFinalVigilCandle() {
    return gameState.inventory.some(item => item.name === "Final Vigil Candle");
}

function hasBlessedRosemaryBundle() {
    return gameState.inventory.some(item => item.name === "Blessed Rosemary Bundle");
}

function getDeadVillagerKeys() {
    return Object.keys(gameState.villagers).filter((key) => {
        const villager = gameState.villagers[key];
        return villager.active && villager.dead;
    });
}

function getLivingInfectedVillagerKeys() {
    return Object.keys(gameState.villagers).filter((key) => {
        const villager = gameState.villagers[key];
        return villager.active && !villager.dead && !villager.healed && villager.infectionLevel > 0;
    })
}

// Prayer Effects
// Prayer 1: Resurrection Prayer
function applyResurrectionPrayer() {

    const deadVillagers = getDeadVillagerKeys();

    if (deadVillagers.length === 0) {
        alert("No villagers are dead.");
        chapelActionCompleted = false;
        chapelChoiceBox.style.display = "flex";
        return;
    }

    if (!canSpendActionToken(2)) {
        chapelActionCompleted = false;
        chapelChoiceBox.style.display = "flex";
        return;
    }

    spendActionToken(2);

    const hasCandle = hasFinalVigilCandle();
    const reviveChance = hasCandle ? 0.35 : 0.15;

    let revivedNames = [];

    deadVillagers.forEach((villagerKey) => {
        if (Math.random() < reviveChance) {
            const villager = gameState.villagers[villagerKey];
            villager.dead = false;
            villager.healed = false;
            villager.feverSuppressed = false;
            villager.infectionLevel = 85;

            revivedNames.push(villagerDatabase[villagerKey].name);
        }
    });

    if (hasCandle) {
        consumePrayerItem("Final Vigil Candle");
    }

    updateVillageVisual();
    updateObjectivePanel();
    renderInventory();

    if (typeof renderVillagerScene === "function") {
        renderVillagerScene();
    }

    if (typeof renderVillagerInfection === "function") {
        renderVillagerInfection();
    }

    let popupText = "You offer a desperate prayer for the dead.\n\n";

    if (revivedNames.length > 0) {
        popupText += `Returned to life: ${revivedNames.join(", ")}\n\n`;
    } else {
        popupText += "No villagers returned to life.\n\n";
    }

    if (hasCandle) {
        popupText += "Your Final Vigil Candle strengthened the prayer.";
    } else {
        popupText += "You prayed without a funeral candle to guide the rite.";
    }

    showChapelEffectPopup(popupText);
}

// Prayer 2: Healing Prayer
function applyHealingPrayer() {

    const livingVillagers = getLivingInfectedVillagerKeys();

    if (livingVillagers.length === 0) {
        alert("No living villagers need healing.");
        chapelActionCompleted = false;
        chapelChoiceBox.style.display = "flex";
        return;
    }

    if (!canSpendActionToken(2)) {
        chapelActionCompleted = false;
        chapelChoiceBox.style.display = "flex";
        return;
    }

    spendActionToken(2);

    const hasRosemary = hasBlessedRosemaryBundle();
    const healChance = hasRosemary ? 0.50 : 0.15;

    let soothedNames = [];
    let healedNames = [];

    livingVillagers.forEach((villagerKey) => {
        if (Math.random() < healChance) {
            const villager = gameState.villagers[villagerKey];
            villager.infectionLevel -= 10;

            if (villager.infectionLevel < 0) {
                villager.infectionLevel = 0;
            }

            if (villager.infectionLevel === 0 && !villager.healed) {
                villager.healed = true;
                gameState.villagersHealed += 1;
                healedNames.push(villagerDatabase[villagerKey].name);
            } else {
                soothedNames.push(villagerDatabase[villagerKey].name);
            }
        }
    });

    if (hasRosemary) {
        consumePrayerItem("Blessed Rosemary Bundle");
    }

    updateVillageVisual();
    updateObjectivePanel();
    renderInventory();

    if (typeof renderVillagerScene === "function") {
        renderVillagerScene();
    }

    if (typeof renderVillagerInfection === "function") {
        renderVillagerInfection();
    }

    let popupText = "You offer a prayer for the living.\n\n";

    if (soothedNames.length > 0) {
        popupText += `Infection eased for: ${soothedNames.join(", ")}\n\n`;
    }

    if (healedNames.length > 0) {
        popupText += `Fully healed: ${healedNames.join(", ")}\n\n`;
    }

    if (soothedNames.length === 0 && healedNames.length === 0) {
        popupText += "No relief came this time.\n\n";
    }

    if (hasRosemary) {
        popupText += "Your Blessed Rosemary Bundle strengthened the prayer.";
    } else {
        popupText += "You prayed without a healing bundle to aid the rite.";
    }

    showChapelEffectPopup(popupText);
}

// Consume prayer charm items
function consumePrayerItem(itemName) {
    const item = gameState.inventory.find((invItem) => invItem.name === itemName);

    if (item) {
        removeItemFromInventory(item);
    }
}

// Chapel Timer
function startChapelReflectionTimer(seconds, onComplete) {

    chapelReflectionTimerBox.style.display = "block";
    let timeLeft = seconds;
    chapelReflectionTimerText.textContent = `Praying... ${timeLeft}s`;

    const timer = setInterval(() => {
        timeLeft--;
        chapelReflectionTimerText.textContent = `Praying... ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            chapelReflectionTimerBox.style.display = "none";

            if (typeof onComplete === "function") {
                onComplete();
            }
        }
    }, 1000);

}

// function applyChapelReflectionBenefits() {
//     let plagueReducedBy = 0;

//     if (Math.random() < 0.7) {
//         plagueReducedBy = Math.floor(Math.random() * 3) + 2;
//         decreasePlagueLevel(plagueReducedBy);
//     }

//     let popupText = "You reflect quietly with the villagers.\n\nEffect:\n";

//     if (plagueReducedBy > 0) {
//         popupText += `• Plague Level decreases by ${plagueReducedBy}\n\n`;
//     } else {
//         popupText += "• Plague Level does not change this time\n\n";
//     }

//     popupText += `Current Plague Level: ${plagueLevel}\n\nThe calmer atmosphere in the chapel gives the village a small chance to recover.`;

//     chapelCharacterName.textContent = "Narrator";
//     chapelDialogueText.textContent = "The chapel grows quiet as the villagers sit in silence.";
//     showChapelEffectPopup(popupText);
// }

function resetChapelScene() {
    clearInterval(chapelTypingInterval);

    chapelDialogueIndex = 0;
    chapelActionCompleted = false;

    chapelEffectPopup.style.display = "none";
    chapelReflectionTimerBox.style.display = "none";
    chapelChoiceBox.style.display = "none";
    chapelNextArrow.style.opacity = 0;

    hideChapelVillagers();
    buildChapelDialogue();
    showChapelDialogue();
}

function registerChapelSceneEnterHook(sceneID, callback) {
    if (!window.__sceneEnterHooks) {
        window.__sceneEnterHooks = {};
    }

    if (!window.__sceneEnterHooks[sceneID]) {
        window.__sceneEnterHooks[sceneID] = [];
    }

    if (!window.__sceneEnterHooks[sceneID].includes(callback)) {
        window.__sceneEnterHooks[sceneID].push(callback);
    }

    if (typeof window.showScene === "function" && !window.showScene.__sceneHookWrapped) {
        const originalShowScene = window.showScene;

        const wrappedShowScene = function (nextSceneID) {
            originalShowScene(nextSceneID);

            const sceneHooks = window.__sceneEnterHooks[nextSceneID] || [];
            sceneHooks.forEach((hook) => hook());
        };

        wrappedShowScene.__sceneHookWrapped = true;
        window.showScene = wrappedShowScene;

        if (typeof showScene === "function") {
            showScene = wrappedShowScene;
        }
    }
}

chapelNextArrow.addEventListener("click", () => {
    if (chapelIsTyping) return;

    chapelDialogueIndex++;

    if (chapelDialogueIndex < chapelDialogueLines.length) {
        showChapelDialogue();
    }
});

chapelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        if (chapelActionCompleted) return;

        const choice = btn.dataset.choice;
        chapelActionCompleted = true;
        chapelChoiceBox.style.display = "none";
        chapelNextArrow.style.opacity = 0;
        hideChapelVillagers();
        chapelCharacterName.textContent = "Narrator";

        if (choice === "pray-dead") {
            setChapelDoctor("center");
            chapelDialogueText.textContent = "You bow your head and pray over the dead.";
            startChapelReflectionTimer(5, applyResurrectionPrayer);
        }

        if (choice === "pray-living") {
            setChapelDoctor("center");
            chapelDialogueText.textContent = "You bow your head to pray with the sick.";
            startChapelReflectionTimer(5, applyHealingPrayer);
        }

        if (choice === "leave") {
            showScene("arrivalScene");
        }
    });
});

chapelCloseEffectPopupBtn.addEventListener("click", () => {
    chapelCloseEffectPopupBtn.style.display = "none";
    chapelLeaveChapelBtn.style.display = "inline-block";
});

chapelLeaveChapelBtn.addEventListener("click", () => {
    showScene("arrivalScene");
});

registerChapelSceneEnterHook("chapelScene", resetChapelScene);
resetChapelScene();

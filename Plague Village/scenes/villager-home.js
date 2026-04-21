// VILLAGER HOME HEALING SCENE

// Grabs the scene element from our main HTML document
const villagerHealingScene = document.getElementById("villagerHealingScene");

// 1. ADD YOUR SCENE'S HTML CODE INSIDE THE INNERHTML TEMPLATE LITERAL BELOW
villagerHealingScene.innerHTML = `
    <img id="plagueDoctor" src="images/characters/plagueDoctor.png" alt="Plague Doctor">
    <img id="villagerPortrait" src="" alt="Villager portrait">

    <div id="villagerTreatmentUI">
        <div id="villagerTreatmentLabel">Villager Infection</div>

        <div id="villagerInfectionContainer">
            <div id="villagerInfectionBar"></div>
        </div>

        <div id="villagerInfectionValue">100%</div>
    </div>

    <div id="villagerHomeDialogueBox">
        <div id="villagerHomeCharacterName">Sick Villager:</div>
        <div id="villagerHomeDialogueText"></div>
        <div id="villagerHomeActionBox" class="fightChoiceBox"></div>
        <div id="villagerHomeNextArrow">➤</div>
    </div>
`

// 2. ADD SCENE SPECIFIC JS HERE -- Do not redeclare global variables/functions that are already in script.js
// If needed, rename your local variables to avoid conflicts with script.js

// Tracks which villager is being treated
let activeVillagerKey = null;
let villagerHomeDialogueIndex = 0;
let villagerHomeTypingTimer = null;
let villagerHomeIsTyping = false;

const villagerHomeDialogueText = document.getElementById("villagerHomeDialogueText");
const villagerHomeNextArrow = document.getElementById("villagerHomeNextArrow");
const villagerHomeCharacterName = document.getElementById("villagerHomeCharacterName");
const villagerHomeActionBox = document.getElementById("villagerHomeActionBox");

const healHouseDialogue1 = [
    "Weak breathing fills the room…",
    "…Is someone there?",
    "I heard you were ill. I’ve come to help.",
    "A Plague doctor healer…? I must be dreaming…",
    "No dream. Just hold still, this will ease your pain.",
    "Thank you… truly…"
];

const healHouseDialogue2 = [
    "A faint groan echoes from the bed",
    "Please… it hurts…",
    "Easy now. I’ve brought medicine.",
    "You’re not from around here… why help me?",
    "Because you need it. That’s enough.",
    "…Kind soul…",
    "Drink this potion, Slowly."
];

const healHouseDialogue3 = [
    "The room smells of herbs and sickness",
    "Another visitor…? I don’t have much to give…",
    "I’m not here for payment. I’m here to heal you.",
    "…You would do that for free?",
    "Your life matters more than a small starry gold coin.",
    "I… I don’t know what to say…",
    "Say nothing. Just rest, and take this."
];

const healHouseDialogue4 = [
    "Coughing intensifies as you enter",
    "Stay back… I don’t want to spread this…",
    "It’s alright. I know how to handle it.",
    "You shouldn’t risk yourself…",
    "Someone has to.",
    "…You’re brave… or foolish…",
    "Maybe both. Now let me help you."
];

const healHouseDialogue5 = [
    "The sickly barely stirs",
    "…Water…",
    "Here. And something stronger to help you recover.",
    "Who… are you…?",
    "Just someone passing through.",
    "Then why stop…?",
    "Because I could.",
    "…That’s enough reason… thank you…",
    "Rest. You’ll be alright."
];

const healHouseDialogue6 = [
    "A weak voice calls out",
    "Is it over…?",
    "Not yet, because you’re going to make it.",
    "I’ve been waiting… so long…",
    "You won’t have to wait anymore."
];

const healHouseDialogue7 = [
    "The air is quiet, almost still",
    "I thought no one would come…",
    "You’re not alone. I’m here now.",
    "Too late… I can feel myself fading…",
    "No. Not today.",
    "…What are you doing…?",
    "Something to keep you here a while longer."
];

const healHouseDialogue8 = [
    "A shallow cough breaks the silence",
    "Don’t come too close… I’m not well…",
    "That’s exactly why I’m here.",
    "You’re a doctor?",
    "Something like that. Let’s get you stable first.",
    "…I didn’t think help would actually come…"
];

const healHouseDialogue9 = [
    "Soft footsteps echo across polished floors",
    "You may approach… the sick is within the chamber.",
    "A doctor? At last… the court sent you quickly.",
    "I came as soon as I was called. But it wasn't the court that was sent.",
    "…So this is what it feels like to be fragile… even here…",
    "Stay calm. You’re in good hands now.",
    "If you succeed… the palace will not forget this.",
    "I hope the palace does, I want nothing but to save you.",
    "…Then I will trust you, stranger…"
];

const healHouseDialogue10 = [
    "Wind slips through gaps in the wooden walls",
    "…Who’s there…?",
    "I heard someone was sick. I came to help.",
    "I don’t have a coin…",
    "I don’t need a coin. Just let me in.",
    "I'm in the hay…",
    "It’s okay… don’t worry… I’m not leaving you like this.",
    "It hurts… I can’t sleep…",
    "Hold still. This will help ease it.",
    "…Thank you… I thought no one would come…"
];

const villagerHomeDialogueByKey = {
    villager1: healHouseDialogue1,
    villager2: healHouseDialogue2,
    villager3: healHouseDialogue3,
    villager4: healHouseDialogue4,
    villager5: healHouseDialogue9,
    villager6: healHouseDialogue10,
    villager7: healHouseDialogue7,
    villager8: healHouseDialogue8,
    villager9: healHouseDialogue5,
    villager10: healHouseDialogue6
};

const villagerHomeSpeakerByKey = {
    villager1: [
        "Narrator:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:"
    ],
    villager2: [
        "Narrator:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:"
    ],
    villager3: [
        "Narrator:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:"
    ],
    villager4: [
        "Narrator:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:"
    ],
    villager5: [
        "Narrator:",
        "Royal Attendant:",
        "Noble Patient:",
        "Plague Doctor:",
        "Noble Patient:",
        "Plague Doctor:",
        "Noble Patient:",
        "Plague Doctor:",
        "Noble Patient:"
    ],
    villager6: [
        "Narrator:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:"
    ],
    villager7: [
        "Narrator:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:"
    ],
    villager8: [
        "Narrator:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:"
    ],
    villager9: [
        "Narrator:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:"
    ],
    villager10: [
        "Narrator:",
        "Sick Villager:",
        "Plague Doctor:",
        "Sick Villager:",
        "Plague Doctor:"
    ]
};

function getActiveVillagerDialogue() {
    return villagerHomeDialogueByKey[activeVillagerKey] || [];
}

function getActiveVillagerSpeakers() {
    return villagerHomeSpeakerByKey[activeVillagerKey] || [];
}

function getVillagerHomeSpeakerForLine(lineIndex) {
    const speakers = getActiveVillagerSpeakers();

    if (speakers[lineIndex]) {
        return speakers[lineIndex];
    }

    return "Sick Villager:";
}

function typeVillagerHomeLine(line) {
    if (!villagerHomeDialogueText) return;

    if (villagerHomeTypingTimer) {
        clearInterval(villagerHomeTypingTimer);
        villagerHomeTypingTimer = null;
    }

    villagerHomeDialogueText.textContent = "";
    villagerHomeIsTyping = true;

    if (villagerHomeNextArrow) {
        villagerHomeNextArrow.style.opacity = 0;
    }

    const effectiveTypingSpeed = typeof typingSpeed === "number" ? typingSpeed : 40;
    let index = 0;

    villagerHomeTypingTimer = setInterval(() => {
        if (index < line.length) {
            villagerHomeDialogueText.textContent += line.charAt(index);

            if (typeof playRandomTypeSound === "function") {
                playRandomTypeSound();
            }

            index += 1;
            return;
        }

        clearInterval(villagerHomeTypingTimer);
        villagerHomeTypingTimer = null;
        villagerHomeIsTyping = false;

        const dialogue = getActiveVillagerDialogue();
        const isFinalLine = villagerHomeDialogueIndex >= dialogue.length - 1;
        const villager = getActiveVillager();
        const canShowActions = Boolean(villager) && !villager.dead && !villager.healed;

        if (isFinalLine && canShowActions) {
            showVillagerHomeActionChoices();
        } else if (!canShowActions) {
            hideVillagerHomeActionChoices();
        }

        if (villagerHomeNextArrow) {
            villagerHomeNextArrow.style.opacity = isFinalLine ? 0 : 1;
        }
    }, effectiveTypingSpeed);
}

function showVillagerHomeActionChoices() {
    if (!villagerHomeActionBox) return;

    const villager = getActiveVillager();

    if (!villager || villager.dead || villager.healed) {
        hideVillagerHomeActionChoices();
        return;
    }

    villagerHomeActionBox.innerHTML = `
        <button class="choiceBtn villagerActionBtn healBtn" data-choice="heal">heal</button>
    `;
    villagerHomeActionBox.style.display = "grid";
}

function hideVillagerHomeActionChoices() {
    if (!villagerHomeActionBox) return;

    villagerHomeActionBox.innerHTML = "";
    villagerHomeActionBox.style.display = "none";
}

function getHealingTonicFromInventory() {
    return gameState.inventory.find((item) => {
        return item.category === "potion" && item.family === "healingTonic";
    }) || null;
}

function returnToMainVillageAfterVillagerAction() {
    if (typeof renderVillagerSelectList === "function") {
        renderVillagerSelectList();
    }

    if (typeof updateObjectivePanel === "function") {
        updateObjectivePanel();
    }

    if (typeof updateVillageVisual === "function") {
        updateVillageVisual();
    }

    showScene("arrivalScene");
}

function handleVillagerHealChoice() {
    const villager = getActiveVillager();

    if (!villager) {
        villagerHomeCharacterName.textContent = "Plague Doctor:";
        villagerHomeDialogueText.textContent = "No villager is selected.";
        return;
    }

    if (villager.dead) {
        villagerHomeCharacterName.textContent = "Plague Doctor:";
        villagerHomeDialogueText.textContent = "This villager has already passed.";
        return;
    }

    if (villager.healed) {
        hideVillagerHomeActionChoices();
        return;
    }

    const healingTonic = getHealingTonicFromInventory();

    if (!healingTonic) {
        villagerHomeCharacterName.textContent = "Plague Doctor:";
        villagerHomeDialogueText.textContent = "You need a Healing Tonic in your inventory to heal this villager.";
        return;
    }

    removeItemFromInventory(healingTonic);
    hideVillagerHomeActionChoices();

    const villagerDies = Math.random() < 0.2;

    if (villagerDies) {
        villager.dead = true;
        villager.healed = false;
        villager.feverSuppressed = false;
        villager.infectionLevel = 100;

        villagerHomeCharacterName.textContent = "Narrator:";
        villagerHomeDialogueText.textContent = "The treatment failed. The villager died.";
    } else {
        villager.dead = false;
        villager.healed = true;
        villager.feverSuppressed = false;
        villager.infectionLevel = 0;
        gameState.villagersHealed += 1;

        villagerHomeCharacterName.textContent = "Narrator:";
        villagerHomeDialogueText.textContent = "The Healing Tonic worked. The villager has been healed.";
    }

    if (typeof renderInventory === "function") {
        renderInventory();
    }

    renderVillagerInfection();
    renderVillagerScene();

    setTimeout(() => {
        returnToMainVillageAfterVillagerAction();
    }, 900);
}

function advanceVillagerHomeDialogue() {
    if (villagerHomeIsTyping) return;

    const dialogue = getActiveVillagerDialogue();
    if (dialogue.length === 0) return;

    if (villagerHomeDialogueIndex < dialogue.length - 1) {
        villagerHomeDialogueIndex += 1;
        showVillagerHomeDialogueLine();
        return;
    }

    if (villagerHomeNextArrow) {
        villagerHomeNextArrow.style.opacity = 0;
    }
}

function showVillagerHomeDialogueLine() {
    const dialogue = getActiveVillagerDialogue();

    if (dialogue.length === 0) {
        if (villagerHomeDialogueText) {
            villagerHomeDialogueText.textContent = "";
        }

        if (villagerHomeNextArrow) {
            villagerHomeNextArrow.style.opacity = 0;
        }
        return;
    }

    if (villagerHomeDialogueIndex < 0) {
        villagerHomeDialogueIndex = 0;
    }

    if (villagerHomeDialogueIndex >= dialogue.length) {
        villagerHomeDialogueIndex = dialogue.length - 1;
    }

    if (villagerHomeCharacterName) {
        villagerHomeCharacterName.textContent = getVillagerHomeSpeakerForLine(villagerHomeDialogueIndex);
    }

    typeVillagerHomeLine(dialogue[villagerHomeDialogueIndex]);
}

function resetVillagerHomeDialogue() {
    hideVillagerHomeActionChoices();
    villagerHomeDialogueIndex = 0;
    showVillagerHomeDialogueLine();
}

if (villagerHomeNextArrow) {
    villagerHomeNextArrow.addEventListener("click", () => {
        advanceVillagerHomeDialogue();
    });
}

if (villagerHomeActionBox) {
    villagerHomeActionBox.addEventListener("click", (e) => {
        if (!e.target.classList.contains("villagerActionBtn")) return;

        const choice = e.target.dataset.choice;

        if (choice === "heal") {
            handleVillagerHealChoice();
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (e.code !== "Space") return;

    const villagerSceneVisible = villagerHealingScene.style.display === "block";
    if (!villagerSceneVisible) return;

    e.preventDefault();
    advanceVillagerHomeDialogue();
});

function setActiveVillager(villagerKey) {
    activeVillagerKey = villagerKey;
    renderVillagerScene();
    renderVillagerInfection();
    resetVillagerHomeDialogue();
}

function getActiveVillager() {
    return gameState.villagers[activeVillagerKey];
}

// Shows villager infection level based on which villager is active
function renderVillagerInfection() {
    const villager = getActiveVillager();
    const bar = document.getElementById("villagerInfectionBar");
    const value = document.getElementById("villagerInfectionValue");

    if (!villager || !bar || !value) return;

    bar.style.width = `${villager.infectionLevel}%`;

    if (villager.dead) {
        value.textContent = "Deceased";
    } else if (villager.healed) {
        value.textContent = "Healed";
    } else {
        value.textContent = `${villager.infectionLevel}%`;
    }
}

function renderVillagerScene() {
    if (!activeVillagerKey) return;

    const villagerData = villagerDatabase[activeVillagerKey];
    const villagerState = gameState.villagers[activeVillagerKey];

    const portrait = document.getElementById("villagerPortrait");

    if (!villagerData || !villagerState || !portrait) return;

    villagerHealingScene.style.backgroundImage = `url('${villagerData.bg}')`;
    portrait.classList.toggle("villager2Lower", activeVillagerKey === "villager2");
    portrait.classList.toggle("villager3Lower", activeVillagerKey === "villager3");
    portrait.classList.toggle("villager4Lower", activeVillagerKey === "villager4");
    portrait.classList.toggle("villager5Lower", activeVillagerKey === "villager5");
    portrait.classList.toggle("villager7Lower", activeVillagerKey === "villager7");
    portrait.classList.toggle("villager9Lower", activeVillagerKey === "villager9");
    portrait.classList.toggle("villager10Lower", activeVillagerKey === "villager10");

    if (villagerState.dead) {
        portrait.src = villagerData.portrait_sick;
        portrait.style.opacity = "0.45";
        portrait.style.filter = "grayscale(100%)";
    } else if (villagerState.healed) {
        portrait.src = villagerData.portrait_healthy;
        portrait.style.opacity = "1";
        portrait.style.filter = "none";
    } else {
        portrait.src = villagerData.portrait_sick;
        portrait.style.opacity = "1";
        portrait.style.filter = "none";
    }
}

renderVillagerInfection();

// 3. Go to index.html, scroll to the bottom and add a <script> element linking to this scene's js file
// (Keep the JS script element underneath the data/items.js and script.js elements so they load first)
// NOTE: For this scene I have already attached the <script> element so that I could implement the Villager Infection Bar functionality,
// so this step can be skipped.

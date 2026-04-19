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

const ratDialogueByRat = {
    rat1: [
        "Watch out villager! There's a pesky rat by that shack.",
        "It's bee-lining straight toward us!",
        "Screeeeeeee!",
        "The diseased rat bares its filthy stinky teeth.",
        "It lunges forward! Just after the villager moved out of the way"
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
        "Redoing this"
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
    ]
};

let ratCurrentDialogue = [];
let ratCurrentLine = 0;
let ratIsTyping = false;
let ratTypingInterval = null;
let ratLootPopupOpen = false;

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

            if (ratNextArrow) {
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

function showRatLootPopup(foundItems) {
    ratLootItems.innerHTML = "";

    if (foundItems.length === 0) {
        ratLootItems.innerHTML = "<p>The rat fled, but dropped nothing useful.</p>";
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

function handleRatActionChoice(choice) {
    if (ratLootPopupOpen) return;

    if (choice === "fight") {
        attackActiveRat();
        return;
    }

    if (choice === "run") {
        alert("You retreated from the encounter.");
        showScene("arrivalScene");
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

    if (!canSpendActionToken(1)) return;

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

    if (rat.hp <= 0) {
        rat.hp = 0;
        rat.dead = true;
        gameState.ratsKilled += 1;
        renderRatSelectList();
        updateObjectivePanel();
        const defeatMessage = fightInfectionGain > 0
            ? `Rat defeated! You gained ${fightInfectionGain}% infection.`
            : "Rat defeated!";
        alert(defeatMessage);
    } else if (fightInfectionGain > 0) {
        ratSpeakerName.textContent = "Narrator:";
        ratDialogueText.textContent = `The rat fights back. You gained ${fightInfectionGain}% infection.`;
    }

    spendActionToken(1);
    renderRatHp();
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
        ratLootPopup.style.display = "none";
        ratLootPopupOpen = false;

        ratActionBox.style.pointerEvents = "auto";
        showScene("arrivalScene");
    });
}

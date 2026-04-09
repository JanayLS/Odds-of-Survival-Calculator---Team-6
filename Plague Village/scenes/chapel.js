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
    <img id="chapelBackground" src="images/backgrounds/chapel-background.png" alt="Chapel Background">

    <img id="chapelDoctor" src="images/characters/plagueDoctor1.png" alt="Plague Doctor">

    <img id="chapelOldMan" class="chapelCharacter" src="images/characters/OldManVillagerConcerned.png" alt="Old Villager">
    <img id="chapelWoman1" class="chapelCharacter" src="images/characters/WomanVillagerConcerned1.png" alt="Worried Woman">
    <img id="chapelWoman2" class="chapelCharacter" src="images/characters/WomanVillagerConcerened2.png" alt="Frightened Villager">

    <div id="chapelDialogueBox">
        <div id="chapelCharacterName">Narrator</div>
        <div id="chapelDialogueText"></div>

        <div id="chapelChoiceBox">
            <button class="chapelChoiceBtn" data-choice="reflect">Reflect with the villagers</button>
            <button class="chapelChoiceBtn" data-choice="comfort">Comfort the villagers</button>
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

let plagueLevel = parseInt(localStorage.getItem("plagueLevel")) || 50;

function savePlagueLevel() {
    localStorage.setItem("plagueLevel", plagueLevel);
}

function decreasePlagueLevel(amount) {
    plagueLevel = Math.max(0, plagueLevel - amount);
    savePlagueLevel();
}

function setChapelDoctor(stage) {
    if (stage === "entrance") {
        chapelDoctor.src = "images/characters/plagueDoctor1.png";
        chapelDoctor.className = "chapelDoctorEntrance";
    } else if (stage === "talking") {
        chapelDoctor.src = "images/characters/plagueDoctor2.png";
        chapelDoctor.className = "chapelDoctorTalking";
    } else if (stage === "center") {
        chapelDoctor.src = "images/characters/plagueDoctor3.png";
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

function startChapelReflectionTimer(seconds) {
    chapelReflectionTimerBox.style.display = "block";
    let timeLeft = seconds;
    chapelReflectionTimerText.textContent = `Reflecting... ${timeLeft}s`;

    const timer = setInterval(() => {
        timeLeft--;
        chapelReflectionTimerText.textContent = `Reflecting... ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            chapelReflectionTimerBox.style.display = "none";
            applyChapelReflectionBenefits();
        }
    }, 1000);
}

function applyChapelReflectionBenefits() {
    let plagueReducedBy = 0;

    if (Math.random() < 0.7) {
        plagueReducedBy = Math.floor(Math.random() * 3) + 2;
        decreasePlagueLevel(plagueReducedBy);
    }

    let popupText = "You reflect quietly with the villagers.\n\nEffect:\n";

    if (plagueReducedBy > 0) {
        popupText += `• Plague Level decreases by ${plagueReducedBy}\n\n`;
    } else {
        popupText += "• Plague Level does not change this time\n\n";
    }

    popupText += `Current Plague Level: ${plagueLevel}\n\nThe calmer atmosphere in the chapel gives the village a small chance to recover.`;

    chapelCharacterName.textContent = "Narrator";
    chapelDialogueText.textContent = "The chapel grows quiet as the villagers sit in silence.";
    showChapelEffectPopup(popupText);
}

function resetChapelScene() {
    clearInterval(chapelTypingInterval);
    plagueLevel = parseInt(localStorage.getItem("plagueLevel")) || 50;

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

        if (choice === "reflect") {
            setChapelDoctor("center");
            chapelDialogueText.textContent = "You sit among the villagers in quiet reflection.";
            startChapelReflectionTimer(5);
        }

        if (choice === "comfort") {
            setChapelDoctor("center");
            chapelDialogueText.textContent = "You speak calmly to the frightened villagers.";

            let popupText = "You comfort the frightened villagers.\n\nEffect:\n";

            if (Math.random() < 0.5) {
                const plagueReducedBy = 1;
                decreasePlagueLevel(plagueReducedBy);
                popupText += `• Plague Level decreases by ${plagueReducedBy}\n\nThe villagers cooperate more, and the sickness eases slightly.`;
            } else {
                popupText += "• Plague Level does not change this time\n\nThe chapel feels steadier, even if the sickness has not yet eased.";
            }

            popupText += `\n\nCurrent Plague Level: ${plagueLevel}`;
            showChapelEffectPopup(popupText);
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

// Hook scene reset into the app's existing showScene() with minimal change
if (!window.__sceneEnterHooksInstalled) {
    window.__sceneEnterHooksInstalled = true;
    window.__sceneEnterHooks = {};

    const originalShowScene = typeof showScene === "function" ? showScene : window.showScene;
    const wrappedShowScene = function (sceneID) {
        originalShowScene(sceneID);

        if (window.__sceneEnterHooks[sceneID]) {
            window.__sceneEnterHooks[sceneID].forEach(fn => fn());
        }
    };

    window.showScene = wrappedShowScene;
    showScene = wrappedShowScene;
}

if (!window.__sceneEnterHooks["chapelScene"]) {
    window.__sceneEnterHooks["chapelScene"] = [];
}
window.__sceneEnterHooks["chapelScene"].push(resetChapelScene);

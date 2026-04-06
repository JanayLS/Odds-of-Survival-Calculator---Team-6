// --------------------------------------------------
// DIALOGUE STATE
// --------------------------------------------------
let currentLine = 0;
let isTyping = false;
let typingSpeed = 25;
let currentDialogue = [];

// --------------------------------------------------
// GAME STATS
// --------------------------------------------------
const villagersSavedToday = parseInt(localStorage.getItem("villagersSavedToday")) || 0;
const villagersAlive = parseInt(localStorage.getItem("villagersAlive")) || 0;
const villagePlagueLevel = parseFloat(localStorage.getItem("villagePlagueLevel")) || 0;
const doctorInfection = parseFloat(localStorage.getItem("doctorInfection")) || 0;
const dayNumber = parseInt(localStorage.getItem("dayNumber")) || 10;

// --------------------------------------------------
// DIALOGUE
// --------------------------------------------------
const endingEDialogue = [
    "The final day has come.",
    "Yet the plague still lingers through the village streets.",
    "The homes still stand, but peace has not returned.",
    "No true cure was found. No final victory was won.",
    "The people endure... but their fate remains uncertain.",
    `Day Reached: ${dayNumber}
Villagers Saved Today: ${villagersSavedToday}
Villagers Alive: ${villagersAlive}
Village Plague Level: ${villagePlagueLevel}%
Doctor Infection: ${doctorInfection}%`,
    "For now, the story ends not with triumph... but with doubt."
];

// --------------------------------------------------
// HTML ELEMENTS
// --------------------------------------------------
const dialogueText = document.getElementById("dialogueText");
const characterName = document.getElementById("characterName");
const nextArrow = document.getElementById("nextArrow");

// --------------------------------------------------
// TYPEWRITER DIALOGUE
// --------------------------------------------------
function typeLine(line) {
    dialogueText.textContent = "";
    nextArrow.style.opacity = 0;

    let i = 0;
    isTyping = true;

    const interval = setInterval(() => {
        dialogueText.textContent += line.charAt(i);
        i++;

        if (i >= line.length) {
            clearInterval(interval);
            isTyping = false;
            nextArrow.style.opacity = 1;
        }
    }, typingSpeed);
}

function nextDialogue() {
    if (isTyping) return;

    currentLine++;

    if (currentLine < currentDialogue.length) {
        typeLine(currentDialogue[currentLine]);
    } else {
        window.location.href = "credits.html";
    }
}

nextArrow.addEventListener("click", nextDialogue);

// Optional keyboard support
document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && !isTyping) {
        nextDialogue();
    }
});

// --------------------------------------------------
// INITIAL LOAD
// --------------------------------------------------
function startEndingE() {
    characterName.textContent = "Narrator:";
    currentDialogue = endingEDialogue;
    currentLine = 0;
    typeLine(currentDialogue[currentLine]);
}

startEndingE();
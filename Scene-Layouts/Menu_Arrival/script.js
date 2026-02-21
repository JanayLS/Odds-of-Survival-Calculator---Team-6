// INITIALIZE HTML ELEMENTS
// --------------------------------------------------------------------------------
// Characters
const villager1 = document.getElementById('villager1');
const worriedVillagerWoman = document.getElementById('worriedVillagerWoman');
const characterName = document.getElementById('characterName');

// Controls current dialogue branch/scene state
// Starts as intro, changes as scene progresses
// Possible values: "intro", "villagers", "rats", "supplies"
let sceneState = "intro";

// Main menu, Arrival Scene, Start Game Button
const mainMenu = document.getElementById('mainMenu');
const arrivalScene = document.getElementById('arrivalScene');
const startGameBtn = document.getElementById('startGameBtn');

// Turn music on or off with Music On button
const bgm = document.getElementById('bgm');
const btn = document.getElementById('turn-music-on')
bgm.load();

// Choice Box Elements
const choiceBox = document.getElementById('choiceBox');
const choiceButtons = document.querySelectorAll('.choiceBtn');

// Dialogue Box and Text
const dialogueBox = document.getElementById('dialogueBox');
const dialogueText = document.getElementById('dialogueText');
const arrow = document.getElementById('nextArrow');

// Inventory
const inventoryBtn = document.getElementById('inventoryBtn')
const inventoryPanel = document.getElementById('inventoryPanel')
const inventoryHintArrow = document.getElementById('inventoryHintArrow')

// TRANSITION FROM MENU SCENE TO ARRIVAL/INTRO SCENE
// ----------------------------------------------------------------------------------
// Start the first line after start game button is clicked
startGameBtn.addEventListener("click", () => {

    // Hide main menu and show Arrival scene
    mainMenu.style.display = "none";
    arrivalScene.style.display = "block";

    // Start villager NPC dialogue
    currentLine = 0;
    dialogueText.innerHTML = "";
    typeLine(dialogueLines[currentLine]);
})

// DIALOGUE SYSTEM AND CHOICES
// ------------------------------------------------------------------------------------
// Navigation Arrow beahvior
arrow.addEventListener("click", nextDialogue);

// Intro Scene Dialogue Lines (Villager 1 Opening Sequence)
const dialogueLines = [
    "Doctor...thank the Heavens you've arrived.",
    "Our people are sick. Some are dying.",
    "Rats roam our streets at night.",
    "If you cannot save us...no one will."
];

// Dialogue Typing Behavior
// Start with the first line (index 0) and set base typing speed for animation
let currentLine = 0;
let isTyping = false;
let typingSpeed = 30;

// Typing Animation for Dialogue Text
// Disables navigation arrow while typing
// Navigation arrow reappears when dialogue line is complete
function typeLine(line) {
    dialogueText.textContent = "";
    arrow.style.opacity = 0;
    let i = 0;
    isTyping = true;

    const interval = setInterval(() => {
        dialogueText.textContent += line.charAt(i);
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

        // Choice 1: Ask About Villagers activates "villagers" scene state
    } else if (sceneState == "villagers") {
        arrow.style.opacity = 0;

        choiceBox.innerHTML = `
        <button class="choiceBtn">Heal Villager in Home</button>
        <button class="choiceBtn">Pray at Chapel</button>`;

        choiceBox.style.display = "flex";

        // Choice 2: Ask about Rats activates "rats" scene state
    } else if (sceneState == "rats") {
        arrow.style.opacity = 0;

        choiceBox.innerHTML = `
        <button class="choiceBtn">Fight Rats</button>
        <button class="choiceBtn">Shop for Weapons/Rat Poison</button>`;

        choiceBox.style.display = "flex";

        // Choice 3: Ask about supplies activates "supplies" scene state
    } else if (sceneState == "supplies") {
        arrow.style.opacity = 0;

        choiceBox.innerHTML = `
        <button class="choiceBtn">Search Forest for Ingredients</button>
        <button class="choiceBtn">Brew Ingredients</button>`;

        choiceBox.style.display = "flex";
    }
};

// Choice Navigation
// Options:
// Choice 1: Ask about villagers -> Worried Wife Dialogue -> Heal Villager at Home OR Pray at Chapel
// Choice 2: Ask about rats -> Villager Rat Dialogue -> Fight Rat OR [Rat-Related Choice Placeholder 2]
// Choice 3: Check supplies -> Supplies Game Dialogue -> Collect Ingredients in Forest OR Shop for Ingredients
choiceButtons.forEach(button => {
    button.addEventListener("click", () => {
        const choice = button.dataset.choice;
        choiceBox.style.display = "none";

        // Choice 1: Villager
        if (choice == "villagers") {
            sceneState = "villagers";
            currentLine = 0;

            characterName.textContent = "Worried Wife:";

            villager1.style.opacity = 0;
            worriedVillagerWoman.style.opacity = 1;

            setTimeout(() => {
                typeLine("Doctor...my husband hasn't woken in two days...");
            }, 600);


        }

        // Choice 2: Rats
        else if (choice == "rats") {
            sceneState = "rats";
            currentLine = 0;

            typeLine("The rats are the plague itself. They scurry through our village, infecting our people. One bite can mean death...");
        }

        // Choice 3: Supplies
        else if (choice == "supplies") {
            sceneState = "supplies";
            currentLine = 0;

            characterName.textContent = "";

            inventoryBtn.style.display = "block";
            inventoryHintArrow.style.opacity = "1";

            setTimeout(() => {
                inventoryHintArrow.style.opacity = "0";
            }, 4000);

            typeLine(`You check your satchel. Your supplies are limited. To create cures, you must gather ingredients from the forest. 
                Each potion requires careful preparation. Mistakes may cost lives -- including your own.`);
        }
    })
})

// Music Button Logic
btn.addEventListener("click", () => {
    if (bgm.paused) {
        bgm.play();
        btn.textContent = "Music Off";
    } else {
        bgm.pause();
        btn.textContent = "Music On";
    }
})

// Inventory Button Logic
inventoryBtn.addEventListener("click", () => {
    if (inventoryPanel.style.display == "none") {
        inventoryPanel.style.display = "block";
    } else {
        inventoryPanel.style.display = "none";
    }
})
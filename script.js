// INITIALIZE HTML ELEMENTS
// --------------------------------------------------------------------------------
// Characters
const villager1 = document.getElementById('villager1');
const worriedVillagerWoman = document.getElementById('worriedVillagerWoman');
const characterName = document.getElementById('characterName');
const plagueRat = document.getElementById("plagueRat");

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

const typeSounds = document.querySelectorAll(".typeSound");

let lastSoundIndex = -1;

// Dialogue Typing Behavior
// Start with the first line (index 0) and set base typing speed for animation
let currentLine = 0;
let isTyping = false;
let baseTypingSpeed = 40;
let typingSpeed = baseTypingSpeed;


// Randomises the text sound
function playRandomTypeSound() {
    let randomIndex;

    // Prevent same sound twice in a row
    do {
        randomIndex = Math.floor(Math.random() * typeSounds.length);
    } while (randomIndex === lastSoundIndex);

    lastSoundIndex = randomIndex;

    const sound = typeSounds[randomIndex];
    sound.currentTime = 0;
    sound.volume = 0.7 + Math.random() * 0.3; // small volume variation to sound more natural
    sound.play();
}

// Choice Box Elements
const choiceBox = document.getElementById('choiceBox');
const choiceButtons = document.querySelectorAll('.choiceBtn');

// Dialogue Box and Text
const dialogueBox = document.getElementById('dialogueBox');
const dialogueText = document.getElementById('dialogueText');
const arrow = document.getElementById('nextArrow');


// Pause Screen
const pauseScreen = document.getElementById("pauseScreen");
const resumeBtn = document.getElementById("resumeBtn");
const pauseScreenBtn = document.getElementById("pause-screen-Btn")

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

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();

        // Only triggers if the main menu is NOT displayed
        if (mainMenu.style.display === "none") {
            nextDialogue();
        }
    }
    //EventListener for b key press to go backwards
    if (e.key.toLowerCase() === "b") {
        previousDialogue();
    }
});

// Function to return you to the previous line as long as the current line is greater than 0
function previousDialogue() {
    if (isTyping) return;

    if (sceneState === "intro") {

        if (currentLine > 0) {
            currentLine--;
            typeLine(dialogueLines[currentLine]);
        }

    }
}

document.addEventListener("keydown", (e) => {

    if (e.code === "Space") {
        typingSpeed = baseTypingSpeed / 2; // 2x faster
    }

});

document.addEventListener("keyup", (e) => {

    if (e.code === "Space") {
        typingSpeed = baseTypingSpeed; // back to normal
    }

});







// Intro Scene Dialogue Lines (Villager 1 Opening Sequence)
const dialogueLines = [
    "Doctor...thank the Heavens you've arrived.",
    "Our people are sick. Some are dying.",
    "Rats roam our streets at night.",
    "If you cannot save us...no one will."
];

// Other dialogue lines

const ratIntroDoctor = [
    "Watch out villager! There's a pesky rat by that shack.",
    "It's bee-lining straight toward us!"
];

const ratDialogue = [
    "Screeeeeeee!",
    "The diseased rat bares its filthy stinky teeth.",
    "It lunges forward! Just after the villager moved out of the way"
];


// Typing Animation for Dialogue Text
// Disables navigation arrow while typing
// Navigation arrow reappears when dialogue line is complete
function typeLine(line) {

    dialogueText.textContent = "";
    arrow.style.opacity = 0;

    let i = 0;
    isTyping = true;

    function typeCharacter() {

        const char = line.charAt(i);
        dialogueText.textContent += char;

        if (char !== " ") {
            playRandomTypeSound();
        }

        i++;

        if (i < line.length) {
            setTimeout(typeCharacter, typingSpeed);
        } else {
            isTyping = false;
            arrow.style.opacity = 1;
        }
    }

    typeCharacter();
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
        <button class="choiceBtn" data-choice="fightRats">Fight Rats</button>
        <button class="choiceBtn" data-choice="ratShop">Shop for Weapons/Rat Poison</button>
        `;

        choiceBox.style.display = "flex";

        // Choice 3: Ask about supplies activates "supplies" scene state
    } else if (sceneState == "supplies") {
        arrow.style.opacity = 0;

        choiceBox.innerHTML = `
        <button class="choiceBtn">Search Forest for Ingredients</button>
        <button class="choiceBtn">Brew Potions</button>`;

        choiceBox.style.display = "flex";
    }

    else if (sceneState === "ratEncounter") {

    currentLine++;

    // Doctor dialogue first
    if (currentLine < ratIntroDoctor.length) {

        characterName.textContent = "Plague Doctor:";
        typeLine(ratIntroDoctor[currentLine]);

    }

    // Then rat dialogue
    else if (currentLine - ratIntroDoctor.length < ratDialogue.length) {

        const ratIndex = currentLine - ratIntroDoctor.length;

        plagueRat.style.opacity = 1;
        plagueRat.style.transform = "scale(1.8)";

        characterName.textContent = "Diseased Rat:";
        typeLine(ratDialogue[ratIndex]);

    }

    // After dialogue show fight options
    else {

        arrow.style.opacity = 0;
        villager1.style.opacity = 0;

        plagueRat.style.left = "2vw";
        plagueRat.style.bottom = "-2vw";
        plagueRat.style.width = "35vw";

        choiceBox.classList.add("fightChoiceBox");

        choiceBox.innerHTML = `
        <button class="choiceBtn">Run away</button>
        <button class="choiceBtn">Scare him</button>
        <button class="choiceBtn">Observe</button>
        <button class="choiceBtn">FIGHT</button>
        `;

        choiceBox.style.display = "grid";
    }
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

       
    })
})

// BUTTONS
// --------------------------------------------------------------------------------
// Music Button Logic
btn.addEventListener("click", () => {
    if (bgm.paused) {
        bgm.play();
        btn.textContent = "Music Off";
    } else {
        bgm.pause();
        btn.textContent = "Music On";
    }
});


//Pause Menu button
pauseScreenBtn.addEventListener("click", () => {

    arrivalScene.style.display = "none";
    pauseScreen.style.display = "block";

    bgm.pause();
});

resumeBtn.addEventListener("click", () => {

    pauseScreen.style.display = "none";
    arrivalScene.style.display = "block";

    bgm.play();
});

//Fight Rats

choiceBox.addEventListener("click", (e) => {

    const choice = e.target.dataset.choice;

    if(choice === "fightRats"){

        sceneState = "ratEncounter";

        currentLine = 0;

        choiceBox.style.display = "none";

        characterName.textContent = "Plague Doctor:";

        typeLine(ratIntroDoctor[currentLine]);

    }

});

//Inventory
const inventory = {
    BitterMushroom: 0,
    GoldenGarlicBulb: 0,
    HawthornBerries: 0,
    MintLeaves: 0,
    MoldyWood: 0,
    SilverLeaf: 0,
    Thyme: 0,
    Yarrow: 0,
    BoneAsh: 0,
    CharcoalPowder: 0,
    BitterMushroomConcoction: 0,
    CharcoalPowderConcoction: 0,
    MoldedWoodConcoction: 0,
    BoneAshRemedy: 0,
    CharcoalPowderRemedy: 0,
    GarlicBulbRemedy: 0,
    CharcoalPowderElixir: 0,
    GarlicPowderElixir: 0,
    SilverLeafElixir: 0,
    MintHealingTonic: 0,
    SilverLeafHealingTonic: 0,
    YarrowHealingTonic: 0,
    FeverHawthornSuppressant: 0,
    FeverMintSuppressant: 0,
    FeverThymeSuppressant: 0,
    Gold: 0,
};

const inventoryGrid = document.getElementById("inventoryGrid");

for (let item in inventory) {

    const slot = document.createElement("div");

    slot.classList.add("inventorySlot");

    slot.innerHTML = `
        <img src="Assets/${item}.png" class="inventoryItem">
        <span class="itemCount" id="${item}Count">0</span>
    `;

    inventoryGrid.appendChild(slot);

}

function addItem(itemName){

    inventory[itemName]++;

    document.getElementById(itemName + "Count").textContent = inventory[itemName];

}

function removeItem(itemName, amount){

    inventory[itemName] -= amount;

    document.getElementById(itemName + "Count").textContent = inventory[itemName];

}

const inventoryPanel = document.getElementById("inventoryPanel");
const inventoryButton = document.getElementById("inventoryBtn");

inventoryButton.addEventListener("click", () => {

    if (inventoryPanel.style.display === "block") {
        inventoryPanel.style.display = "none";
    } else {
        inventoryPanel.style.display = "block";
    }

});



addItem("Gold");
addItem("Gold");
addItem("Thyme");
// ------------------------
// INITIALIZE HTML ELEMENTS
// ------------------------

// Characters
const villager1 = document.getElementById('villager1');
const worriedVillagerWoman = document.getElementById('worriedVillagerWoman');
const sickVillager = document.getElementById('sickVillager');
const plagueRat = document.getElementById('plagueRat');
const characterName = document.getElementById('characterName');

// Dialogue box elements
const dialogueBox = document.getElementById('dialogueBox');
const dialogueText = document.getElementById('dialogueText');
const choiceBox = document.getElementById('choiceBox');
const arrow = document.getElementById('nextArrow');

// Main menu and scene
const mainMenu = document.getElementById('mainMenu');
const arrivalScene = document.getElementById('arrivalScene');
const startGameBtn = document.getElementById('startGameBtn');

// Music
const bgm = document.getElementById('bgm');
const btn = document.getElementById('turn-music-on');
bgm.load();

// Pause screen
const pauseScreen = document.getElementById('pauseScreen');
const resumeBtn = document.getElementById('resumeBtn');
const pauseScreenBtn = document.getElementById('pause-screen-Btn');

// Typing sounds
const typeSounds = document.querySelectorAll(".typeSound");
let lastSoundIndex = -1;


// ------------------------
// GLOBAL STATE VARIABLES
// ------------------------
let sceneState = "intro"; // intro, villagers, rats, supplies, healHouse, ratEncounter
let currentLine = 0;
let isTyping = false;
let baseTypingSpeed = 40;
let typingSpeed = baseTypingSpeed;
let currentFightPath = null;

//preload so no lag
const sickRoomBg = new Image();
sickRoomBg.src = "Assets/SickRoom.png";

//RollPotion
function rollPotionOutcome(potionName) {
    const chance = potionSuccessRates[potionName] || 0.5; 
    return Math.random() < chance;
}

// ------------------------
// DIALOGUE LINES
// ------------------------

// Intro Scene
const dialogueLines = [
    "Doctor...thank the Heavens you've arrived.",
    "Our people are sick. Some are dying.",
    "Rats roam our streets at night.",
    "If you cannot save us...no one will."
];

// Rat Encounter
const ratIntroDoctor = [
    "Watch out villager! There's a pesky rat by that shack.",
    "It's bee-lining straight toward us!"
];

const ratDialogue = [
    "Screeeeeeee!",
    "The diseased rat bares its filthy stinky teeth.",
    "It lunges forward! Just after the villager moved out of the way"
];

// Heal Villager
const healHouseDialogue = [
    "*Cough… cough…*",
    "Sweetie… is that you?",
    "Yes father! I brought someone to help you!",
    "Good evening. Do not worry. I am here to help you. I have brought potions and remedies.",
    "A doctor…? Truly? Oh thank the heavens… I thought I might not last the night.",
    "See father? I told you help would come!",
    "Rest now, and we will begin your treatment.",
    "Thank you doctor… you’ve given this old man hope."
];

// Potion list
const healingPotions = [
    "MintHealingTonic",
    "SilverLeafHealingTonic",
    "YarrowHealingTonic",

    "FeverHawthornSuppressant",
    "FeverMintSuppressant",
    "FeverThymeSuppressant"
];

//Rat Scene
const fightOutcomes = {
    fight: [
        "Stand back. I will handle this creature.",
        "A dose of my concoction should suffice.",
        "Now... hold still, vermin.",
        "There. The rat is no more."
    ],
    run: [
        "This is not worth the risk. We run away.",
        "Stay close. Do not look behind you.",
        "The rat will not chase for long..."
    ],
    scare: [
        "Begone, foul abomination.",
        "You are no match for a trained physician.",
        "I am much stronger than you.",
        "Hmph. It retreats. As expected."
    ],
    observe: [
        "Curious...",
        "Its movements are deliberate.",
        "This is no ordinary rat.",
        "I must study it more."
    ]
};


//End A Scene
const endingADialogue = [
    "Another day has passed, and the village breathes easier.",
    "The sick have been tended, and the rats kept at bay.",
    "Hope lingers in the streets, as families find a moment of peace.",
    "For today, the plague has not claimed us… we have survived."
];

//Potion Dialogue
const healSuccess1 = [
    "The treatment is working... his breathing is steadying.",
    "Color returning to his face.",
    "He will live."
];

const healSuccess2 = [
    "The potion takes effect almost instantly.",
    "His coughing is fading.",
    "He will slowly open his eyes... he's alive."
];

const healFail1 = [
    "...Something is wrong.",
    "His coughing grows violent...",
    "...and then it... stopped.",
    "The patient has died."
];

const healFail2 = [
    "The medicine is not reacting well.",
    "His body is trembling uncontrollably.",
    "The life is fading from his eyes.",
    "I was too late."
];

const villagerWomanTalk = [
    "Thank you so much for saving him!!",
    "We will be forever in debt to you",
    "Heres a small compensation, its all we have",
];

// ------------------------
// HELPER FUNCTIONS
// ------------------------

// Pick a random element from an array
function pickRandomVariant(options) {
    return options[Math.floor(Math.random() * options.length)];
}

// Play a random typing sound
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

// Typewriter effect for dialogue
function typeLine(line) {
    dialogueText.textContent = "";
    arrow.style.opacity = 0;
    let i = 0;
    isTyping = true;

    function typeCharacter() {
        const char = line.charAt(i);
        dialogueText.textContent += char;

        if (char !== " ") playRandomTypeSound();

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

// ------------------------
// START GAME
// ------------------------
startGameBtn.addEventListener("click", () => {
    mainMenu.style.display = "none";
    arrivalScene.style.display = "block";
    currentLine = 0;
    typeLine(dialogueLines[currentLine]);
});

// ------------------------
// NAVIGATION
// ------------------------

// Arrow and Spacebar navigation
arrow.addEventListener("click", nextDialogue);
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        if (mainMenu.style.display === "none") nextDialogue();
        typingSpeed = baseTypingSpeed / 2;
    }
    if (e.key.toLowerCase() === "b") previousDialogue();
});
document.addEventListener("keyup", (e) => {
    if (e.code === "Space") typingSpeed = baseTypingSpeed;
});

// Go back to previous line
function previousDialogue() {
    if (isTyping) return;

    if (sceneState === "intro" && currentLine > 0) {
        currentLine--;
        typeLine(dialogueLines[currentLine]);
    }
    else if (sceneState === "ratEncounter") {
        if (currentLine > 0) currentLine--;
        if (currentLine < ratIntroDoctor.length) {
            characterName.textContent = "Plague Doctor:";
            typeLine(ratIntroDoctor[currentLine]);
        } else {
            characterName.textContent = "Diseased Rat:";
            typeLine(ratDialogue[currentLine - ratIntroDoctor.length]);
        }
    }
    else if (sceneState === "healHouse" && currentLine > 0) {
        currentLine--;
        typeLine(healHouseDialogue[currentLine]);
    }
}

// ------------------------
// DIALOGUE ADVANCEMENT
// ------------------------
function nextDialogue() {
    if (isTyping) return;

    switch (sceneState) {
        // ------------------------
        case "intro":
            currentLine++;
            if (currentLine < dialogueLines.length) {
                typeLine(dialogueLines[currentLine]);
            } else {
                arrow.style.opacity = 0;
                choiceBox.style.display = "flex";
            }
            break;

        // ------------------------
        case "villagers":
            arrow.style.opacity = 0;
            choiceBox.innerHTML = `
                <button class="choiceBtn" data-choice="healHouse">Heal Villager in Home</button>
                <button class="choiceBtn" data-choice="chapel">Pray at Chapel</button>
            `;
            choiceBox.style.display = "flex";
            break;

        // ------------------------
        case "rats":
            arrow.style.opacity = 0;
            choiceBox.innerHTML = `
                <button class="choiceBtn" data-choice="fightRats">Fight Rats</button>
                <button class="choiceBtn" data-choice="ratShop">Shop for Weapons/Rat Poison</button>
            `;
            choiceBox.style.display = "flex";
            break;

        // ------------------------
        case "supplies":
            arrow.style.opacity = 0;
            choiceBox.innerHTML = `
                <button class="choiceBtn">Search Forest for Ingredients</button>
                <button class="choiceBtn">Brew Potions</button>
            `;
            choiceBox.style.display = "flex";
            break;

        // ------------------------
        case "ratEncounter":
            currentLine++;
            if (currentLine < ratIntroDoctor.length) {
                characterName.textContent = "Plague Doctor:";
                typeLine(ratIntroDoctor[currentLine]);
            } else if (currentLine - ratIntroDoctor.length < ratDialogue.length) {
                const ratIndex = currentLine - ratIntroDoctor.length;
                plagueRat.style.opacity = 1;
                plagueRat.style.transform = "scale(1.8)";
                characterName.textContent = "Diseased Rat:";
                typeLine(ratDialogue[ratIndex]);
            } else {
                arrow.style.opacity = 0;
                villager1.style.opacity = 0;
                plagueRat.style.left = "2vw";
                plagueRat.style.bottom = "-2vw";
                plagueRat.style.width = "35vw";
                choiceBox.classList.add("fightChoiceBox");
                choiceBox.innerHTML = `
                    <button class="choiceBtn" data-choice="run">Run away</button>
                    <button class="choiceBtn" data-choice="scare">Scare him</button>
                    <button class="choiceBtn" data-choice="observe">Observe</button>
                    <button class="choiceBtn" data-choice="fight">FIGHT</button>
                `;
                choiceBox.style.display = "grid";
            }
            break;

        // ------------------------
        case "healHouse":
            currentLine++;

            if (currentLine < healHouseDialogue.length) {

                if (currentLine === 0 || currentLine === 1 || currentLine === 4 || currentLine === 7) {
                    characterName.textContent = "Sick Villager:";
                }
                else if (currentLine === 2 || currentLine === 5) {
                    characterName.textContent = "Daughter:";
                }
                else {
                    characterName.textContent = "Plague Doctor:";
                }

                typeLine(healHouseDialogue[currentLine]);

            } else {

                arrow.style.opacity = 0;

                choiceBox.innerHTML = `
                <button class="choiceBtn" data-choice="leavePatient">Leave</button>
                <button class="choiceBtn" data-choice="giveMedicine">Give Medicine</button>
                `;

                choiceBox.style.display = "flex";

            }
            break;
        case "fightResult":
            currentLine++;

            if (currentLine < fightOutcomes[currentFightPath].length) {
                typeLine(fightOutcomes[currentFightPath][currentLine]);
            } else {

                arrow.style.opacity = 0;

                choiceBox.innerHTML = `
                    <button class="choiceBtn" data-choice="afterFightContinue">Continue</button>
                `;
                choiceBox.style.display = "flex";
            }
            break;
        case "afterFightContinue":
            console.log("Continue story after fight...");
            // next scene goes here later
            break;

            
        case "afterHeal":
            console.log("Patient healed, continue story...");
            break;
        
        case "endingA":
            currentLine++;
            if (currentLine < endingADialogue.length) {
                characterName.textContent = "Plague Doctor:";
                typeLine(endingADialogue[currentLine]);
            } else {
                arrow.style.opacity = 0;
                choiceBox.innerHTML = `
                    <button class="choiceBtn" data-choice="afterEndingA">Continue</button>
                `;
                choiceBox.style.display = "flex";
            }
            break;

        case "healSuccess1":
            currentLine++;
            if (currentLine < healSuccess1.length) {
                typeLine(healSuccess1[currentLine]);
            } else {
                arrow.style.opacity = 0;
                choiceBox.innerHTML = `
                    <button class="choiceBtn" data-choice="afterHeal">Continue</button>
                `;
                choiceBox.style.display = "flex";
            }
            break;

        case "healSuccess2":
            currentLine++;
            if (currentLine < healSuccess2.length) {
                typeLine(healSuccess2[currentLine]);
            } else {
                arrow.style.opacity = 0;
                choiceBox.innerHTML = `
                    <button class="choiceBtn" data-choice="afterHeal">Continue</button>
                `;
                choiceBox.style.display = "flex";
            }
            break;

        case "healFail1":
            currentLine++;
            if (currentLine < healFail1.length) {
                typeLine(healFail1[currentLine]);
            } else {
                arrow.style.opacity = 0;
                choiceBox.innerHTML = `
                    <button class="choiceBtn" data-choice="afterHeal">Continue</button>
                `;
                choiceBox.style.display = "flex";
            }
            break;

        case "healFail2":
            currentLine++;
            if (currentLine < healFail2.length) {
                typeLine(healFail2[currentLine]);
            } else {
                arrow.style.opacity = 0;
                choiceBox.innerHTML = `
                    <button class="choiceBtn" data-choice="afterHeal">Continue</button>
                `;
                choiceBox.style.display = "flex";
            }
            break;

        case "villagerWomanTalk":
            currentLine++;

            if (currentLine < villagerWomanTalk.length) {

                // Hide sick villager
                sickVillager.style.display = "none";

                // Show worried wife in same position
                worriedVillagerWoman.style.display = "block";
                worriedVillagerWoman.style.opacity = 0;
                worriedVillagerWoman.style.transition = "opacity 0.6s ease";
                worriedVillagerWoman.style.width = "20vw";      // match sick villager
                worriedVillagerWoman.style.bottom = "-3vw";     // match sick villager
                worriedVillagerWoman.style.left = "0";          // match sick villager

                setTimeout(() => {
                    worriedVillagerWoman.style.opacity = 1;
                }, 50);

                characterName.textContent = "Worried Wife:";
                typeLine(villagerWomanTalk[currentLine]);
            } else {
                arrow.style.opacity = 0;
                choiceBox.innerHTML = `
                    <button class="choiceBtn" data-choice="afterHeal">Continue</button>
                `;
                choiceBox.style.display = "flex";
            }
            break;
        
    }
}

// ------------------------
// CHOICE HANDLING
// ------------------------
choiceBox.addEventListener("click", (e) => {
    const choice = e.target.dataset.choice;
    if (!choice) return;
    choiceBox.style.display = "none";

    switch (choice) {

    case "villagers":
        sceneState = "villagers";
        currentLine = 0;
        villager1.style.opacity = 0;
        worriedVillagerWoman.style.opacity = 1;
        characterName.textContent = "Worried Wife:";
        setTimeout(() => {
            typeLine("Doctor...my husband hasn't woken in two days...");
        }, 600);
        break;

    case "rats":
        sceneState = "rats";
        currentLine = 0;
        typeLine("The rats are the plague itself. They scurry through our village, infecting our people. One bite can mean death...");
        break;

    case "healHouse":
        sceneState = "healHouse";
        currentLine = 0;

        villager1.style.display = "none";
        worriedVillagerWoman.style.display = "none";
        plagueRat.style.display = "none";

        document.body.style.backgroundImage = "url('Assets/SickRoom.png')";

        sickVillager.style.display = "block";
        sickVillager.style.opacity = 0;
        sickVillager.style.transition = "opacity 0.6s ease";
        sickVillager.style.width = "20vw";
        sickVillager.style.bottom = "-3vw";
        sickVillager.style.left = "0";

        setTimeout(() => {
            sickVillager.style.opacity = 1;
        }, 50);

        characterName.textContent = "Sick Villager:";
        typeLine(healHouseDialogue[currentLine]);
        break;

    case "fightRats":
        sceneState = "ratEncounter";
        currentLine = 0;
        plagueRat.style.opacity = 1;
        plagueRat.style.transform = "scale(1.8)";
        characterName.textContent = "Plague Doctor:";
        typeLine(ratIntroDoctor[currentLine]);
        break;

    case "leavePatient":
        console.log("Leaving patient...");
        break;

    case "giveMedicine":
        buildPotionButtons();
        choiceBox.style.display = "grid";
        break;

    case "fight":
    case "run":
    case "scare":
    case "observe":

        sceneState = "fightResult";
        currentLine = 0;

        currentFightPath = choice;

        characterName.textContent = "Plague Doctor:";

        choiceBox.style.display = "none";
        arrow.style.opacity = 1;

        typeLine(fightOutcomes[choice][currentLine]);
        break;



    default:
        break;
}
});

// ------------------------
// MUSIC CONTROL
// ------------------------
btn.addEventListener("click", () => {
    if (bgm.paused) {
        bgm.play();
        btn.textContent = "Music Off";
    } else {
        bgm.pause();
        btn.textContent = "Music On";
    }
});

// ------------------------
// PAUSE SCREEN
// ------------------------
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

const endingABtn = document.getElementById("endingABtn");

endingABtn.addEventListener("click", () => {
    pauseScreen.style.display = "none";
    arrivalScene.style.display = "block";

    villager1.style.opacity = 0;

    sceneState = "endingA";
    currentLine = -1; // start before first line

    characterName.textContent = "Plague Doctor:";
    dialogueText.textContent = "";
    arrow.style.opacity = 0;

    nextDialogue(); // type first line automatically
});

// ------------------------
// INVENTORY SYSTEM
// ------------------------
const inventory = {
    BitterMushroom: 0, GoldenGarlicBulb: 0, HawthornBerries: 0, MintLeaves: 0,
    MoldyWood: 0, SilverLeaf: 0, Thyme: 0, Yarrow: 0, BoneAsh: 0, CharcoalPowder: 0,
    BitterMushroomConcoction: 0, CharcoalPowderConcoction: 0, MoldedWoodConcoction: 0,
    BoneAshRemedy: 0, CharcoalPowderRemedy: 0, GarlicBulbRemedy: 0,
    CharcoalPowderElixir: 0, GarlicPowderElixir: 0, SilverLeafElixir: 0,
    MintHealingTonic: 0, SilverLeafHealingTonic: 0, YarrowHealingTonic: 0,
    FeverHawthornSuppressant: 0, FeverMintSuppressant: 0, FeverThymeSuppressant: 0,
    Gold: 0
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
    inventoryPanel.style.display = inventoryPanel.style.display === "block" ? "none" : "block";
});

// ------------------------
// POTION SYSTEM
// ------------------------
const potionSuccessRates = {
    MintHealingTonic: 0.75,
    SilverLeafHealingTonic: 0.65,
    YarrowHealingTonic: 0.55,

    FeverHawthornSuppressant: 0.2,
    FeverMintSuppressant: 0.35,
    FeverThymeSuppressant: 0.45
};

function buildPotionButtons(){

    choiceBox.innerHTML = "";
    choiceBox.style.display = "grid";
    choiceBox.style.gridTemplateColumns = "repeat(4, 4vw)";
    choiceBox.style.justifyContent = "start";
    choiceBox.style.gap = "3vw";

    healingPotions.forEach(potion => {

        const slot = document.createElement("div");
        slot.classList.add("potionSlot");

        const img = document.createElement("img");
        img.src = `Assets/${potion}.png`;

        const count = document.createElement("span");
        count.classList.add("potionCount");
        count.textContent = inventory[potion];

        slot.appendChild(img);
        slot.appendChild(count);

        if(inventory[potion] > 0){

        slot.addEventListener("click", () => {

        removeItem(potion, 1);

        const success = rollPotionOutcome(potion);

        choiceBox.style.display = "none";
        arrow.style.opacity = 1;

        characterName.textContent = "Plague Doctor:";

        if (success) {
            const variant = pickRandomVariant(["healSuccess1", "healSuccess2"]);
            sceneState = variant;
        } else {
            const variant = pickRandomVariant(["healFail1", "healFail2"]);
            sceneState = variant;
        }

        currentLine = -1; 
        nextDialogue();

        
        if (success) {
            
            const oldNextDialogue = nextDialogue; 
            nextDialogue = function() {
                oldNextDialogue();
                if (sceneState === "healSuccess1" || sceneState === "healSuccess2") {
                    if (currentLine >= (sceneState === "healSuccess1" ? healSuccess1.length - 1 : healSuccess2.length - 1)) {
                        
                        sceneState = "villagerWomanTalk";
                        currentLine = -1;
                        nextDialogue();
                    }
                }
            };
        }

    });

        } else {

            slot.classList.add("potionDisabled");

        }

        choiceBox.appendChild(slot);

    });



    // back button
    const backBtn = document.createElement("button");
    backBtn.classList.add("choiceBtn");
    backBtn.textContent = "Back";

    backBtn.addEventListener("click", () => {

   
    choiceBox.style.display = "flex";
    choiceBox.style.gridTemplateColumns = "";
    choiceBox.style.transform = "";
    choiceBox.style.gap = "";

    choiceBox.innerHTML = `
        <button class="choiceBtn" data-choice="leavePatient">Leave</button>
        <button class="choiceBtn" data-choice="giveMedicine">Give Medicine</button>
    `;
});

    choiceBox.appendChild(backBtn);

}


// Add initial items
addItem("Gold");
addItem("Gold");
addItem("Thyme");
addItem("MintHealingTonic");
// --------------------------------------------------
// GAME STATE
// --------------------------------------------------
let forestLevel = 1;
let inventory = [];

// Dialogue state
let currentLine = 0;
let isTyping = false;
let typingSpeed = 25;
let currentDialogue = [];

// Random gather counts and limits per forest depth
let forestGatherCount = 0;
let deepForestGatherCount = 0;
let deeperForestGatherCount = 0;

let forestGatherLimit = Math.floor(Math.random() * 3) + 1;
let deepForestGatherLimit = Math.floor(Math.random() * 3) + 1;
let deeperForestGatherLimit = Math.floor(Math.random() * 3) + 1;

// --------------------------------------------------
// INGREDIENTS
// --------------------------------------------------
const forestLoot = [
    "Silverleaf",
    "Yarrow",
    "Thyme",
    "Mint leaves",
    "Bitter mushroom",
    "Molded bark",
    "Hawthorn berries",
    "Charcoal powder",
    "Bone ash",
    "Garlic bulb",
    "Nothing Useful"
];

const ingredientImages = {
    "Silverleaf": "assets/silverleaf.png",
    "Yarrow": "assets/yarrow.png",
    "Thyme": "assets/thyme.png",
    "Mint leaves": "assets/mint.png",
    "Bitter mushroom": "assets/bitter-mushroom.png",
    "Molded bark": "assets/molded-bark.png",
    "Hawthorn berries": "assets/hawthorne.png",
    "Charcoal powder": "assets/charcoal-powder.png",
    "Bone ash": "assets/bone-ash.png",
    "Garlic bulb": "assets/garlic-bulb.png"
};

// --------------------------------------------------
// DIALOGUE
// --------------------------------------------------
const forestIntroDialogue = [
    "You step into the forest at the edge of the village.",
    "The air is damp, and the woods seem watchful.",
    "Medicinal plants may still grow here, if the plague has not spoiled them.",
    "You steady your breath and search the shadows ahead.",
    "But be careful, the forest can be dangerous. Rats and worse may lurk within."
];

const deepForestDialogue = [
    "You move deeper into the forest.",
    "The trees grow thicker, and the path becomes harder to follow.",
    "It is darker here, and the rats are harder to spot."
];

const deeperForestDialogue = [
    "You reach the deepest part of the forest.",
    "Little light reaches the ground here.",
    "Stay watchful. You may not be alone..."
];

// --------------------------------------------------
// HTML ELEMENTS
// --------------------------------------------------
const background = document.getElementById("sceneBackground");
const dialogueText = document.getElementById("dialogueText");
const characterName = document.getElementById("characterName");
const choiceBox = document.getElementById("choiceBox");
const buttons = document.querySelectorAll(".choiceBtn");
const nextArrow = document.getElementById("nextArrow");

const lootPopup = document.getElementById("lootPopup");
const lootItems = document.getElementById("lootItems");
const closePopupBtn = document.getElementById("closePopupBtn");

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
        nextArrow.style.opacity = 0;
        choiceBox.style.display = "flex";
        updateSearchButton();
    }
}

nextArrow.addEventListener("click", nextDialogue);

// --------------------------------------------------
// RANDOM HELPERS
// --------------------------------------------------
function getRandomIngredient() {
    const randomIndex = Math.floor(Math.random() * forestLoot.length);
    return forestLoot[randomIndex];
}

function getRandomIngredientCount() {
    return Math.floor(Math.random() * 3) + 1;
}

// --------------------------------------------------
// GATHER MULTIPLE INGREDIENTS
// --------------------------------------------------
function gatherIngredients() {
    const foundItems = [];
    const totalFinds = getRandomIngredientCount();

    for (let i = 0; i < totalFinds; i++) {
        const item = getRandomIngredient();

        if (item !== "Nothing Useful") {
            foundItems.push(item);
            inventory.push(item);
        }
    }

    return foundItems;
}

// --------------------------------------------------
// POPUP
// --------------------------------------------------
function showLootPopup(foundItems) {
    lootItems.innerHTML = "";

    if (foundItems.length === 0) {
        lootItems.innerHTML = "<p>You searched carefully, but found nothing useful.</p>";
    } else {
        foundItems.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("lootCard");

            const img = document.createElement("img");
            img.src = ingredientImages[item];
            img.alt = item;

            img.onerror = function () {
                this.style.display = "none";
            };

            const label = document.createElement("p");
            label.textContent = item;

            card.appendChild(img);
            card.appendChild(label);
            lootItems.appendChild(card);
        });
    }

    lootPopup.style.display = "block";
}

closePopupBtn.addEventListener("click", () => {
    lootPopup.style.display = "none";
});

// --------------------------------------------------
// SEARCH BUTTON TEXT
// --------------------------------------------------
function updateSearchButton() {
    const searchButton = document.querySelector('[data-choice="search"]');

    if (forestLevel === 1 && forestGatherCount >= forestGatherLimit) {
        searchButton.textContent = "Nothing more to gather here";
    } else if (forestLevel === 2 && deepForestGatherCount >= deepForestGatherLimit) {
        searchButton.textContent = "Nothing more to gather here";
    } else if (forestLevel === 3 && deeperForestGatherCount >= deeperForestGatherLimit) {
        searchButton.textContent = "Nothing more to gather here";
    } else {
        searchButton.textContent = "Search for ingredients";
    }
}

// --------------------------------------------------
// UPDATE FOREST DEPTH
// --------------------------------------------------
function updateForestScene() {
    choiceBox.style.display = "none";
    currentLine = 0;
    characterName.textContent = "Narrator:";

    if (forestLevel === 1) {
        background.src = "assets/forest-background.png";
        currentDialogue = forestIntroDialogue;
    } else if (forestLevel === 2) {
        background.src = "assets/forest-background2.png";
        currentDialogue = deepForestDialogue;
    } else {
        background.src = "assets/forest-background3.png";
        currentDialogue = deeperForestDialogue;
    }

    typeLine(currentDialogue[currentLine]);
}

// --------------------------------------------------
// BUTTON EVENTS
// --------------------------------------------------
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const choice = button.dataset.choice;

        // SEARCH
        if (choice === "search") {
            if (forestLevel === 1) {
                if (forestGatherCount >= forestGatherLimit) {
                    dialogueText.textContent = "You have already gathered everything useful in this part of the forest.";
                    return;
                }
                forestGatherCount++;
            } else if (forestLevel === 2) {
                if (deepForestGatherCount >= deepForestGatherLimit) {
                    dialogueText.textContent = "There is nothing more to gather deeper in the forest.";
                    return;
                }
                deepForestGatherCount++;
            } else if (forestLevel === 3) {
                if (deeperForestGatherCount >= deeperForestGatherLimit) {
                    dialogueText.textContent = "The deepest part of the forest has been picked clean.";
                    return;
                }
                deeperForestGatherCount++;
            }

            const foundItems = gatherIngredients();

            if (foundItems.length > 0) {
                dialogueText.textContent = "You search carefully and gather useful ingredients.";
            } else {
                dialogueText.textContent = "You search the area but find nothing useful.";
            }

            showLootPopup(foundItems);
            updateSearchButton();
        }

        // GO DEEPER
        if (choice === "deeper") {
            if (forestLevel < 3) {
                forestLevel++;
                updateForestScene();
            } else {
                dialogueText.textContent = "You cannot go any deeper. The forest is at its darkest here.";
            }
        }

        // RETURN
        if (choice === "return") {
            dialogueText.textContent = "You decide to return to the village.";
        }
    });
});

// --------------------------------------------------
// INITIAL LOAD
// --------------------------------------------------
updateForestScene();
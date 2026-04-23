// Grabs the scene element from our main HTML document

// ADD YOUR SCENE'S HTML CODE INSIDE THE INNERHTML TEMPLATE LITERAL BELOW
// ADD SCENE SPECIFIC JS HERE -- Do not redeclare global variables/functions that are already in script.js
// If needed, rename your local variables to avoid conflicts with script.js

// Remember to go to index.html, scroll to the bottom and add a <script> element linking to this scene's js file
// (Keep the JS script element underneath the data/items.js and script.js elements so they load first)




// Grabs the scene element from our main HTML document
const forestScene = document.getElementById("forestScene");

// ADD YOUR SCENE'S HTML CODE INSIDE THE INNERHTML TEMPLATE LITERAL BELOW
forestScene.innerHTML = `
    <img id="forestBackground" src="/static/img/backgrounds/forest-background.png" alt="Forest Background">
    <img id="forestDoctor" src="/static/img/characters/Plaguedoc.png" alt="Plague Doctor">

    <div id="forestDialogueBox">
        <div id="forestCharacterName">Narrator</div>
        <div id="forestDialogueText"></div>

        <div id="forestChoiceBox">
            <button class="forestChoiceBtn" data-choice="search">Search for ingredients</button>
            <button class="forestChoiceBtn" data-choice="deeper">Go deeper into the forest</button>
            <button class="forestChoiceBtn" data-choice="return">Return to village</button>
        </div>

        <div id="forestNextArrow">➤</div>
    </div>

    <div id="forestLootPopup">
        <h2>You Found</h2>
        <div id="forestLootItems"></div>
        <button id="forestClosePopupBtn">Continue</button>
    </div>
`;

// ADD SCENE SPECIFIC JS HERE -- Do not redeclare global variables/functions that are already in script.js
// If needed, rename your local variables to avoid conflicts with script.js

const forestBackground = forestScene.querySelector("#forestBackground");
const forestDoctor = forestScene.querySelector("#forestDoctor");
const forestCharacterName = forestScene.querySelector("#forestCharacterName");
const forestDialogueText = forestScene.querySelector("#forestDialogueText");
const forestChoiceBox = forestScene.querySelector("#forestChoiceBox");
const forestNextArrow = forestScene.querySelector("#forestNextArrow");

const forestButtons = forestScene.querySelectorAll(".forestChoiceBtn");

const forestLootPopup = forestScene.querySelector("#forestLootPopup");
const forestLootItems = forestScene.querySelector("#forestLootItems");
const forestClosePopupBtn = forestScene.querySelector("#forestClosePopupBtn");

let forestLevel = 1;
let forestCurrentLine = 0;
let forestIsTyping = false;
let forestTypingInterval = null;
let forestCurrentDialogue = [];

let forestGatherCount = 0;
let deepForestGatherCount = 0;
let deeperForestGatherCount = 0;

let forestGatherLimit = 0;
let deepForestGatherLimit = 0;
let deeperForestGatherLimit = 0;

const forestLootPool = [
    "silverleaf",
    "yarrow",
    "thyme",
    "mint",
    "bitterMushroom",
    "moldedBark",
    "hawthorne",
    "charcoalPowder",
    "garlicBulb",
    null
];

const forestIntroDialogue = [
    "You step into the forest at the edge of the village.",
    "The air is damp, and the woods seem watchful.",
    "Medicinal plants may still grow here, if the plague has not spoiled them.",
    "You steady your breath and search the shadows ahead.",
    "But be careful. The forest can be dangerous. Rats and worse may lurk within."
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

function getRandomForestLimit() {
    return Math.floor(Math.random() * 3) + 1;
}

function typeForestLine(text) {
    clearInterval(forestTypingInterval);
    forestIsTyping = true;
    forestDialogueText.textContent = "";
    forestNextArrow.style.opacity = 0;

    let i = 0;
    forestTypingInterval = setInterval(() => {
        forestDialogueText.textContent += text.charAt(i);
        i++;

        if (i >= text.length) {
            clearInterval(forestTypingInterval);
            forestIsTyping = false;
            forestNextArrow.style.opacity = 1;
        }
    }, 25);
}

function updateForestSearchButton() {
    const searchButton = forestScene.querySelector('[data-choice="search"]');

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

function setForestDialogueForLevel() {
    forestCharacterName.textContent = "Narrator";

    if (forestLevel === 1) {
        forestBackground.src = "/static/img/backgrounds/forest-background.png";
        forestCurrentDialogue = forestIntroDialogue;
    } else if (forestLevel === 2) {
        forestBackground.src = "/static/img/backgrounds/forest-background2.png";
        forestCurrentDialogue = deepForestDialogue;
    } else {
        forestBackground.src = "/static/img/backgrounds/forest-background3.png";
        forestCurrentDialogue = deeperForestDialogue;
    }

    forestCurrentLine = 0;
    forestChoiceBox.style.display = "none";
    typeForestLine(forestCurrentDialogue[forestCurrentLine]);
}

function getRandomForestItemKey() {
    const randomIndex = Math.floor(Math.random() * forestLootPool.length);
    return forestLootPool[randomIndex];
}

function getRandomForestItemCount() {
    return Math.floor(Math.random() * 3) + 1;
}

function gatherForestIngredients() {
    const foundItems = [];
    const totalFinds = getRandomForestItemCount();

    for (let i = 0; i < totalFinds; i++) {
        const itemKey = getRandomForestItemKey();

        if (itemKey && itemDatabase[itemKey]) {
            foundItems.push(itemDatabase[itemKey]);
            addItemToInventory(itemDatabase[itemKey]);
        }
    }

    return foundItems;
}

function showForestLootPopup(foundItems) {
    forestLootItems.innerHTML = "";

    if (foundItems.length === 0) {
        forestLootItems.innerHTML = "<p>You searched carefully, but found nothing useful.</p>";
    } else {
        foundItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "forestLootCard";

            const img = document.createElement("img");
            img.src = item.img;
            img.alt = item.name;

            const label = document.createElement("p");
            label.textContent = item.name;

            card.appendChild(img);
            card.appendChild(label);
            forestLootItems.appendChild(card);
        });
    }

    forestLootPopup.style.display = "block";
}

function resetForestScene() {
    clearInterval(forestTypingInterval);

    forestLevel = 1;
    forestCurrentLine = 0;
    forestIsTyping = false;

    forestGatherCount = 0;
    deepForestGatherCount = 0;
    deeperForestGatherCount = 0;

    forestGatherLimit = getRandomForestLimit();
    deepForestGatherLimit = getRandomForestLimit();
    deeperForestGatherLimit = getRandomForestLimit();

    forestLootPopup.style.display = "none";
    forestChoiceBox.style.display = "none";
    forestNextArrow.style.opacity = 0;

    setForestDialogueForLevel();
}

function registerForestSceneEnterHook(sceneID, callback) {
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

forestNextArrow.addEventListener("click", () => {
    if (forestIsTyping) return;

    forestCurrentLine++;

    if (forestCurrentLine < forestCurrentDialogue.length) {
        typeForestLine(forestCurrentDialogue[forestCurrentLine]);
    } else {
        forestNextArrow.style.opacity = 0;
        forestChoiceBox.style.display = "flex";
        updateForestSearchButton();
    }
});

forestButtons.forEach(button => {
    button.addEventListener("click", () => {
        const choice = button.dataset.choice;

        if (choice === "search") {


            if (forestLevel === 1) {
                if (forestGatherCount >= forestGatherLimit) {
                    forestDialogueText.textContent = "You have already gathered everything useful in this part of the forest.";
                    return;
                }
            } else if (forestLevel === 2) {
                if (deepForestGatherCount >= deepForestGatherLimit) {
                    forestDialogueText.textContent = "There is nothing more to gather deeper in the forest.";
                    return;
                }
            } else if (forestLevel === 3) {
                if (deeperForestGatherCount >= deeperForestGatherLimit) {
                    forestDialogueText.textContent = "The deepest part of the forest has been picked clean.";
                    return;
                }
            }

            // Make sure player has enough Action Tokens before searching for ingredients
            if (!canSpendActionToken(1)) {
                return;
            }

            spendActionToken(1);

            if (forestLevel === 1) {
                forestGatherCount++;
            } else if (forestLevel === 2) {
                deepForestGatherCount++;
            } else if (forestLevel === 3) {
                deeperForestGatherCount++;
            }

            const foundItems = gatherForestIngredients();

            if (foundItems.length > 0) {
                forestDialogueText.textContent = "You search carefully and gather useful ingredients.";
            } else {
                forestDialogueText.textContent = "You search the area but find nothing useful.";
            }

            showForestLootPopup(foundItems);
            updateForestSearchButton();
        }

        if (choice === "deeper") {
            if (forestLevel < 3) {
                forestLevel++;
                setForestDialogueForLevel();
            } else {
                forestDialogueText.textContent = "You cannot go any deeper. The forest is at its darkest here.";
            }
        }

        if (choice === "return") {
            showScene("arrivalScene");
        }
    });
});

forestClosePopupBtn.addEventListener("click", () => {
    forestLootPopup.style.display = "none";
});

window.resetForestScene = resetForestScene;
resetForestScene();

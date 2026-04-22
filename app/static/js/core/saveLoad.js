/* static/js/core/saveLoad.js */

async function saveGame() {
    const response = await fetch("/api/save-game", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(gameState),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Failed to save game");
    }

    return data;
}

function restoreLoadedGameState() {
    if (typeof renderMoney === "function") renderMoney();
    if (typeof renderActionTokens === "function") renderActionTokens();
    if (typeof renderDay === "function") renderDay();
    if (typeof renderDoctorInfection === "function") renderDoctorInfection();
    if (typeof renderInventory === "function") renderInventory();
    if (typeof updateObjectivePanel === "function") updateObjectivePanel();
    if (typeof updateVillageVisual === "function") updateVillageVisual();

    if (typeof sceneState !== "undefined") {
        sceneState = gameState.sceneState || "intro";
    }

    if (typeof currentLine !== "undefined") {
        currentLine = Number.isInteger(gameState.currentLine) ? gameState.currentLine : 0;
    }

    if (typeof startItemsGiven !== "undefined") {
        startItemsGiven = !!gameState.startItemsGiven;
    }

    if (typeof currentVillagerKey !== "undefined") {
        currentVillagerKey = gameState.currentVillagerKey || null;
    }

    if (typeof currentRatKey !== "undefined") {
        currentRatKey = gameState.currentRatKey || null;
    }

    if (typeof showScene === "function") {
        showScene(gameState.currentScene || "arrivalScene");
    }

    if (gameState.currentVillagerKey && typeof setActiveVillager === "function") {
        setActiveVillager(gameState.currentVillagerKey);
    }

    if (gameState.currentRatKey && typeof setActiveRat === "function") {
        setActiveRat(gameState.currentRatKey);
    }

    const onArrivalScene = gameState.currentScene === "arrivalScene";

    if (onArrivalScene && typeof handleArrivalSceneReturn === "function") {
        handleArrivalSceneReturn();
    }

    if (
        onArrivalScene &&
        !gameState.askedVillagers &&
        !gameState.askedRats &&
        !gameState.askedSupplies &&
        typeof dialogueText !== "undefined" &&
        typeof dialogueLines !== "undefined" &&
        typeof typeLine === "function"
    ) {
        dialogueText.innerHTML = "";
        typeLine(dialogueLines[gameState.currentLine || 0] || dialogueLines[0]);
    }
}

async function loadGame(options = {}) {
    const { silent = false } = options;

    const response = await fetch("/api/load-game", {
        method: "GET",
        headers: {
            "Accept": "application/json",
        },
        credentials: "same-origin",
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 404) {
        throw new Error(data.error || "No saved game found");
    }

    if (!response.ok) {
        throw new Error(data.error || "Failed to load game");
    }

    Object.assign(gameState, data);
    restoreLoadedGameState();

    if (!silent) {
        alert("Game loaded.");
    }

    return data;
}

window.saveGame = saveGame;
window.loadGame = loadGame;
window.restoreLoadedGameState = restoreLoadedGameState;
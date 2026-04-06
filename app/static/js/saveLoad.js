// saveLoad.js saves and loads game from backend API

import gameState from "./gameState.js";

// Sends gameState data to backend API
export async function saveGame() {
    const response = await fetch("/api/save-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameState)
    });

    if (!response.ok) {
        throw new Error("Failed to save game");
    }

    const result = await response.json();
    console.log("Game saved:", result)
}

// Retrieves gameState data from backend API
export async function loadGame() {
    const response = await fetch("/api/load-game");

    if (!response.ok) {
        throw new Error("Failed to load game");
    }

    const savedData = await response.json();
    Object.assign(gameState, savedData);
    // renderScene(gameState.currentScene);
    // updateHUD();
    // updateInventoryUI();

    console.log("Game loaded:", gameState);
}
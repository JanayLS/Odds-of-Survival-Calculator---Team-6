// gameState.js holds a JSON structure of game data that will be saved/loaded with backend API integration.

const gameState = {
    // Example Data, Will contain real game state data that backend will use for saving/loading the game
    day: 1,
    actionTokens: 7,
    inventory: [],
    money: 5,
    ratsKilled: 0,
    ratsToKill: 0,
    villagersHealed: 0,
    villagersToHeal: 0,
    currentScene: "arrivalScene",
    doctorInfection: 0,
    doctorPoison: 0,
    villagers: {
        villager1: { infectionLevel: 80, dead: false, healed: false },
        villager2: { infectionLevel: 60, dead: false, healed: false },
        villager3: { infectionLevel: 100, dead: true, healed: false },
        villager4: { infectionLevel: 0, dead: false, healed: true },
        villager5: { infectionLevel: 20, dead: false, healed: false },
        villager6: { infectionLevel: 10, dead: false, healed: false },
        villager7: { infectionLevel: 0, dead: false, healed: true },
        villager8: { infectionLevel: 0, dead: false, healed: true },
        villager9: { infectionLevel: 0, dead: false, healed: true },
        villager10: { infectionLevel: 0, dead: false, healed: true }
    },
    rats: {
        rat1: { hp: 100, dead: false },
        rat2: { hp: 100, dead: false },
        rat3: { hp: 0, dead: true },
        rat4: { hp: 10, dead: false },
        rat5: { hp: 80, dead: false },
        rat6: { hp: 75, dead: false },
        rat7: { hp: 60, dead: false },
        rat8: { hp: 0, dead: true },
        rat9: { hp: 50, dead: false }
    }
};

export default gameState;
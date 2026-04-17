// gameState.js holds a JSON structure of game data that will be saved/loaded with backend API integration.

const gameState = {
    // Day
    day: 1,
    maxDays: 3,

    // Action Tokens
    actionTokens: 3,
    maxActionTokens: 3,

    // Inventory & Money
    inventory: [],
    money: 5,

    // Shop Stock
    shopItems: [],

    // Rats Objective
    ratsKilled: 0,
    ratsToKill: 0,

    // Villagers Objective
    villagersHealed: 0,
    villagersToHeal: 0,

    // Current Scene
    currentScene: "arrivalScene",

    // Doctor Status
    doctorInfection: 0,
    doctorPoison: 0,

    // Status of Each Villager
    villagers: {

        villager1: {
            active: false,
            healed: false,
            infectionLevel: 85,
            dead: false,
        },

        villager2: {
            active: false,
            healed: false,
            infectionLevel: 85,
            dead: false,
        },

        villager3: {
            active: false,
            healed: false,
            infectionLevel: 85,
            dead: false,
        },

        villager4: {
            active: false,
            healed: false,
            infectionLevel: 85,
            dead: false,
        },

        villager5: {
            active: false,
            healed: false,
            infectionLevel: 85,
            dead: false,
        },

        villager6: {
            active: false,
            healed: false,
            infectionLevel: 85,
            dead: false,
        },

        villager7: {
            active: false,
            healed: false,
            infectionLevel: 85,
            dead: false,
        },

        villager8: {
            active: false,
            healed: false,
            infectionLevel: 85,
            dead: false,
        },

        villager9: {
            active: false,
            healed: false,
            infectionLevel: 85,
            dead: false,
        },

        villager10: {
            active: false,
            healed: false,
            infectionLevel: 85,
            dead: false,
        }

    },

    // Status of Each Rat
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

window.gameState = gameState;
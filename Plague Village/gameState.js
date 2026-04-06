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
            name: "Villager Name 1",
            infectionLevel: 70,
            dead: false,
            healed: false,
            bg: "images/backgrounds/villager-home-1.png",
            portrait: "images/characters/villager1.png"
        },

        villager2: {
            name: "Villager Name 2",
            infectionLevel: 90,
            dead: false,
            healed: false,
            bg: "images/backgrounds/villager-home-2.png",
            portrait: "images/characters/villager2.png"
        },

        villager3: {
            name: "Villager Name 3",
            infectionLevel: 60,
            dead: false,
            healed: false,
            bg: "images/backgrounds/villager-home-3.png",
            portrait: "images/characters/villager3.png"
        },

        villager4: {
            name: "Villager Name 3",
            infectionLevel: 60,
            dead: false,
            healed: false,
            bg: "images/backgrounds/villager-home-3.png",
            portrait: "images/characters/villager3.png"
        },

        villager5: {
            name: "Villager Name 3",
            infectionLevel: 60,
            dead: false,
            healed: false,
            bg: "images/backgrounds/villager-home-3.png",
            portrait: "images/characters/villager3.png"
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
const itemDatabase = {

    // *************************************
    // INGREDIENTS *************************
    //**************************************

    bitterMushroom: {
        name: "Bitter Mushroom",
        img: "images/ingredients/bitter-mushroom.png",
        description: "Fill in later",
        category: "ingredient",
        weight: 5
    },

    boneAsh: {
        name: "Bone Ash",
        img: "images/ingredients/bone-ash.png",
        description: "Fill in later",
        category: "ingredient",
        weight: 5
    },

    charcoalPowder: {
        name: "Charcoal Powder",
        img: "images/ingredients/charcoal-powder.png",
        description: "Fill in later",
        category: "ingredient",
        weight: 3
    },

    garlicBulb: {
        name: "Garlic Bulb",
        img: "images/ingredients/garlic-bulb.png",
        description: "Fill in later",
        category: "ingredient",
        weight: 8
    },

    hawthorne: {
        name: "Hawthorne",
        img: "images/ingredients/hawthorne.png",
        description: "Fill in later",
        category: "ingredient",
        weight: 7
    },

    mint: {
        name: "Mint",
        img: "images/ingredients/mint.png",
        description: "Fill in later",
        category: "ingredient",
        weight: 6
    },

    moldedBark: {
        name: "Molded Bark",
        img: "images/ingredients/molded-bark.png",
        description: "Fill in later",
        category: "ingredient",
        weight: 7
    },

    silverleaf: {
        name: "Silverleaf",
        img: "images/ingredients/silverleaf.png",
        description: "Fill in later",
        category: "ingredient",
        weight: 6
    },

    thyme: {
        name: "Thyme",
        img: "images/ingredients/thyme.png",
        description: "Fill in later",
        category: "ingredient",
        weight: 9
    },

    yarrow: {
        name: "Yarrow",
        img: "images/ingredients/yarrow.png",
        description: "Fill in later",
        category: "ingredient",
        weight: 6
    },

    // *************************************
    // POTIONS *****************************
    //**************************************
    ashRemedy: {
        name: "Ash Remedy",
        img: "images/potions/ash-remedy.png",
        description: "Fill in later",
        category: "potion",
        weight: 3,
        effectType: "cureDoctorPoison"
    },

    elixir: {
        name: "Elixir",
        img: "images/potions/elixir.png",
        description: "Heals Doctor's Infection",
        category: "potion",
        weight: 4,
        effectType: "reduceDoctorInfection"
    },

    feverSuppressant: {
        name: "Fever Suppressant",
        img: "images/potions/fever-suppressant.png",
        description: "Fill in later",
        category: "potion",
        weight: 6,
        effectType: "suppressVillagerInfection"
    },

    healingTonic: {
        name: "Healing Tonic",
        img: "images/potions/healing-tonic.png",
        description: "Fill in later",
        category: "potion",
        weight: 9,
        effectType: "reduceVillagerInfection"
    },

    plagueConcoction: {
        name: "Plague Concoction",
        img: "images/potions/plague-concoction.png",
        description: "Fill in later",
        category: "potion",
        weight: 2,
        effectType: "poisonRat"
    },

    // *************************************
    // CHARM ITEMS *************************
    //**************************************
    driedToad: {
        name: "Dried Toad",
        img: "images/charm-items/dried-toad.png",
        description: "A symbol of prosperity, dried toad increases chance of finding rare items",
        category: "charm",
        weight: 1
    },

    brilliantEmerald: {
        name: "Brilliant Emerald",
        img: "images/charm-items/shining-emerald.png",
        description: "A beautiful shimmering emerald, increases potency of potions",
        category: "charm",
        weight: 0.5
    },

    rubyAmulet: {
        name: "Ruby Amulet",
        img: "images/charm-items/ruby-amulet.png",
        description: "Shiny red ruby pendant on a thin gold chain, ruby amulet prevents infection",
        category: "charm",
        weight: 0.5
    },

    herbSatchel: {
        name: "Herb Satchel",
        img: "images/charm-items/herb-satchel.png",
        description: "Small cloth satchel of dried herbs, suppresses Doctor's infection status from worsening at end of day.",
        category: "charm",
        effectType: "suppressDoctorInfection"
    }

}
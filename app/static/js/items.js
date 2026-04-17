const itemDatabase = {

    // *************************************
    // INGREDIENTS *************************
    //**************************************

    bitterMushroom: {
        name: "Bitter Mushroom",
        img: "/static/img/ingredients/bitter-mushroom.png",
        description: "Used in plague concoctions to poison rats. A bright red, spotted mushroom with a bitter, toxic flesh.",
        category: "ingredient",
        weight: 5
    },

    boneAsh: {
        name: "Bone Ash",
        img: "/static/img/ingredients/bone-ash.png",
        description: "Used in ash remedies to cure poison. A pale powder made from burned bones with cleansing properties.",
        category: "ingredient",
        weight: 5
    },

    charcoalPowder: {
        name: "Charcoal Powder",
        img: "/static/img/ingredients/charcoal-powder.png",
        description: "Used in strong remedies and concoctions. A coarse black powder known for drawing out toxins.",
        category: "ingredient",
        weight: 3
    },

    garlicBulb: {
        name: "Garlic Bulb",
        img: "/static/img/ingredients/garlic-bulb.png",
        description: "Used in ash remedies and elixirs to protect the body. A sharp, pungent bulb believed to resist infection",
        category: "ingredient",
        weight: 8
    },

    hawthorne: {
        name: "Hawthorne",
        img: "/static/img/ingredients/hawthorne.png",
        description: "Used in fever suppressants. Bright red berries that help stabilize illness and reduce fever.",
        category: "ingredient",
        weight: 7
    },

    mint: {
        name: "Mint",
        img: "/static/img/ingredients/mint.png",
        description: "Used in healing tonics and fever suppressants. A cooling herb that strengthens powerful remedies.",
        category: "ingredient",
        weight: 6
    },

    moldedBark: {
        name: "Molded Bark",
        img: "/static/img/ingredients/molded-bark.png",
        description: "Used in plague concoctions. Rotting bark covered in growth, forming the base of potent rat poisons.",
        category: "ingredient",
        weight: 7
    },

    silverleaf: {
        name: "Silverleaf",
        img: "/static/img/ingredients/silverleaf.png",
        description: "Used in healing tonics and elixirs. A pale medicinal plant known for gently reducing infection.",
        category: "ingredient",
        weight: 6
    },

    thyme: {
        name: "Thyme",
        img: "/static/img/ingredients/thyme.png",
        description: "Used in fever suppressants. A fragrant herb that helps stabilize sickness and ease fever.",
        category: "ingredient",
        weight: 9
    },

    yarrow: {
        name: "Yarrow",
        img: "/static/img/ingredients/yarrow.png",
        description: "Used in healing tonics. A strong medicinal flower that restores the sick and reduces infection.",
        category: "ingredient",
        weight: 6
    },

    // *************************************
    // POTIONS *****************************
    //**************************************
    // Healing Tonic (Silverleaf Healing Tonic - Weak, Yarrow Heaing Tonic - Mid, Mint Healing Tonic - Strong)
    silverleafHealingTonic: {
        name: "Silverleaf Healing Tonic",
        img: "/static/img/potions/silverleaf-healing-tonic.png",
        description: "A silvery, faintly shimmering healing tonic. Reduces villager infection. Effect: Weak.",
        category: "potion",
        weight: 9,
        effectType: "reduceVillagerInfection",
        family: "healingTonic",
        tier: "weak"
    },

    yarrowHealingTonic: {
        name: "Yarrow Healing Tonic",
        img: "/static/img/potions/yarrow-healing-tonic.png",
        description: "A golden yellow bubbling healing tonic. Reduces villager infection. Effect: Mid.",
        category: "potion",
        weight: 9,
        effectType: "reduceVillagerInfection",
        family: "healingTonic",
        tier: "mid"
    },

    mintHealingTonic: {
        name: "Mint Healing Tonic",
        img: "/static/img/potions/mint-healing-tonic.png",
        description: "A vibrant green healing tonic. Reduces villager infection. Effect: Strong.",
        category: "potion",
        weight: 9,
        effectType: "reduceVillagerInfection",
        family: "healingTonic",
        tier: "strong"
    },

    // Fever Suppressant (Thyme Fever Suppressant - Weak, Hawthorne Fever Suppressant - Mid, Mint Fever Suppressant - Strong)
    thymeFeverSuppressant: {
        name: "Thyme Fever Suppressant",
        img: "/static/img/potions/thyme-fever-suppressant.png",
        description: "A fizzy green fever suppressant. Stabilizes villager's infection for 1 day. Effect: Weak.",
        category: "potion",
        weight: 6,
        effectType: "suppressVillagerInfection",
        family: "feverSuppressant",
        tier: "weak"
    },

    hawthorneFeverSuppressant: {
        name: "Hawthorne Fever Suppressant",
        img: "/static/img/potions/hawthorne-fever-suppressant.png",
        description: "A thick orange-red fever suppressant. Stabilizes villager's infection for 1 day and slightly reduces infection. Effect: Mid.",
        category: "potion",
        weight: 6,
        effectType: "suppressVillagerInfection",
        family: "feverSuppressant",
        tier: "mid"
    },

    mintFeverSuppressant: {
        name: "Mint-Fever Suppressant",
        img: "/static/img/potions/mint-fever-suppressant.png",
        description: "A bright green fever suppressant. Stabilizes villager's infection for 1 day and slightly reduces infection. Effect: Strong.",
        category: "potion",
        weight: 6,
        effectType: "suppressVillagerInfection",
        family: "feverSuppressant",
        tier: "strong"
    },

    // Plague Concoction (Mushroom Plague Concoction - Weak, Molded Plague Concoction - Mid, Charcoal Plague Concoction - Strong)
    bitterPlagueConcoction: {
        name: "Bitter Plague Concoction",
        img: "/static/img/potions/bitter-plague-concoction.png",
        description: "A swirling amber plague concoction with a bitter taste. Poisons rats. Effect: Weak.",
        category: "potion",
        weight: 2,
        effectType: "poisonRat",
        family: "plagueConcoction",
        tier: "weak"
    },

    moldyPlagueConcoction: {
        name: "Moldy Plague Concoction",
        img: "/static/img/potions/moldy-plague-concoction.png",
        description: "A syrupy dark green plague concoction with bits of moldy tree bark. Poisons rats. Effect: Mid.",
        category: "potion",
        weight: 2,
        effectType: "poisonRat",
        family: "plagueConcoction",
        tier: "mid"
    },

    charcoalPlagueConcoction: {
        name: "Charcoal Plague Concoction",
        img: "/static/img/potions/charcoal-plague-concoction.png",
        description: "A powerful thick black plague concoction. Poisons rats. Effect: Strong.",
        category: "potion",
        weight: 2,
        effectType: "poisonRat",
        family: "plagueConcoction",
        tier: "strong"
    },

    // Ash Remedy (Bone Ash Remedy - Weak, Garlic Ash Remedy - Mid, Charcoal Ash Remedy - Strong)
    boneAshRemedy: {
        name: "Bone Ash Remedy",
        img: "/static/img/potions/bone-ash-remedy.png",
        description: "A milky white ash remedy. Cures Doctor's poison status. Effect: Weak.",
        category: "potion",
        weight: 3,
        effectType: "cureDoctorPoison",
        family: "ashRemedy",
        tier: "weak"
    },

    garlicAshRemedy: {
        name: "Garlic Ash Remedy",
        img: "/static/img/potions/garlic-ash-remedy.png",
        description: "A bright yellow ash remedy. Cure's Doctor's poison status. Effect: Mid.",
        category: "potion",
        weight: 3,
        effectType: "cureDoctorPoison",
        family: "ashRemedy",
        tier: "mid"
    },

    charcoalAshRemedy: {
        name: "Charcoal Ash Remedy",
        img: "/static/img/potions/charcoal-ash-remedy.png",
        description: "A powdery black ash remedy. Cure's Doctor's poison status. Effect: Strong.",
        category: "potion",
        weight: 3,
        effectType: "cureDoctorPoison",
        family: "ashRemedy",
        tier: "strong"
    },

    // Elixir (Silverleaf Elixir - Weak, Garlic Elixir - Mid, Charcoal Elixir - Strong)
    silverleafElixir: {
        name: "Silverleaf Elixir",
        img: "/static/img/potions/silverleaf-elixir.png",
        description: "A pale, silvery elixir. Heals Doctor's Infection. Effect: Weak.",
        category: "potion",
        weight: 4,
        effectType: "reduceDoctorInfection",
        family: "elixir",
        tier: "weak"
    },

    garlicElixir: {
        name: "Garlic Elixir",
        img: "/static/img/potions/garlic-elixir.png",
        description: "A thick yellow elixir with garlic taste. Heals Doctor's Infection. Effect: Mid.",
        category: "potion",
        weight: 4,
        effectType: "reduceDoctorInfection",
        family: "elixir",
        tier: "mid"
    },

    charcoalElixir: {
        name: "Charcoal Elixir",
        img: "/static/img/potions/charcoal-elixir.png",
        description: "A strong black elixir with a very unpleasant taste. Heals Doctor's Infection. Effect: Strong.",
        category: "potion",
        weight: 4,
        effectType: "reduceDoctorInfection",
        family: "elixir",
        tier: "strong"
    },

    // *************************************
    // CHARM ITEMS *************************
    //**************************************
    driedToad: {
        name: "Dried Toad",
        img: "/static/img/charm-items/dried-toad.png",
        description: "A symbol of prosperity, dried toad increases chance of finding rare items",
        category: "charm",
        weight: 3,
        price: 50
    },

    brilliantEmerald: {
        name: "Brilliant Emerald",
        img: "/static/img/charm-items/brilliant-emerald.png",
        description: "A beautiful shimmering emerald, increases potency of potions",
        category: "charm",
        weight: 2,
        price: 100
    },

    rubyAmulet: {
        name: "Ruby Amulet",
        img: "/static/img/charm-items/ruby-amulet.png",
        description: "Shiny red ruby pendant on a thin gold chain, ruby amulet prevents infection",
        category: "charm",
        weight: 1,
        price: 500
    },

    herbSatchel: {
        name: "Herb Satchel",
        img: "/static/img/charm-items/herb-satchel.png",
        description: "Small cloth satchel of dried herbs, suppresses Doctor's infection status from worsening at end of day.",
        category: "charm",
        price: 30
    }

}
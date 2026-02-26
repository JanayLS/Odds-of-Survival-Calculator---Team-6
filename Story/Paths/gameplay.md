# Plague Village – GamePlay Document
## Overview
Plague Village is a system-driven visual novel set in 1349 during the Black Plague.  
The player takes on the role of a plague doctor attempting to reduce the infection in a dying village.

The game revolves around:
- Gathering ingredients in shop or forest
- Brewing potions
- Treating villagers
- Managing infection risk
- Surviving long enough to reduce the plague
# Core Game Loop
Each day follows this structure:
Player Selects Scene  
→ Perform Scene Action (or Leave)  
→ Player Can Decide to Go to Different Scene  
→ Possible Rat Encounter 
→ Repeat  
→ End Day  
→ End of Day Summary  
→ Check for Ending
→ Repeat Next Day if Successful
## Meters(all affect survivalbility)
- Day
- VillagePlagueLevel (0–100%)
- DoctorInfection (0–100%)
- VillagersAlive
- VillagersInfected
- Inventory
- PotionStock
# Rat Encounter System (examples %)
Rat encounters occur automatically when:
- Entering Forest
- Entering Village Shop
- Random When VilllagePlagueLevel Threshold is Passed
Frequency is based on VillagePlagueLevel:
- 0–29% → 10% chance
- 30–59% → 25% chance
- 60–79% → 45% chance
- 80–100% → 70% chance
Rat encounters may:
- Increase DoctorInfection
- Slightly reduce VillagePlagueLevel (if rats killed)
- Do nothing
# Intro Scene (Day 1 Only)
Narration introduces:
- Setting (1349)
- The dying village
- Player responsibility
After intro, the Main Options are to Ask About Villagers or Rats or Open Medical Bag 
(Whatever option the player selects the player will get more info about since the game just started) (player has to go through asking about all the options in order to get the mission of the game)
## INTRO - ARRIVAL 
 (players click through all three option in order to get information about the game and their role as the player)
Story: Year 1349. The Black Plague spreads across the land, leaving fear, death, and silence in its wake. You are a traveling plague doctor, trained in medicine, and survival. Your journey has brought you to a remote village rumored to be on the brink of collapse.
Dialogue Example:
Villager: Doctor… thank the heavens you have arrived.
Our people are sick. Some are dying. Rats roam our streets at night.
If you cannot save us… no one will.
Player Choice 1:
What do you do first?
1.    Ask about the sick villagers
2.    Ask about the rats
3.    Inspect your medical supplies
(3)
(Ingredients for potions)
Story: You check your satchel. Your supplies are limited. To create cures, you must gather ingredients from the forest and the village. Each potion requires careful preparation. Mistakes may cost lives — including your own.
(2)
(the rats)
Story: The rats are the plague itself. They scurry through our village, infecting our people. One bite can mean death…
(1) 
(the village full of sick villagers) (selection example dialogue)
Villager 1:
Doctor… my husband hasn’t woken in two days.
Villager 2:
Please help my mother…
(etc…. for story plot)
Story: You see the symptoms of the plague: fever, weakness, and labored breathing. Without treatment, their chances of survival are low.

## After Intro:
# Main Options (7 main scenes)
The player can choose:
- Forest
- Village Shop
- Village Chapel
- Brew Potions
- Treat Villagers
- Medical Bag
- End Day 
Each scene has one primary action. (but probability of how successful the actions are depends on the dr health and the village plague level)
# Forest Scene
Options:
- Gather Ingredients
- Leave
If Gather:
- some random forest ingredients found
- DoctorInfection rate increases bc of risk
- Rat encounter (possibility)
Options:
- Go Deeper into Forest to gather (the deeper the player goes the riskier it is)
- Leave
If Go Deeper:
- higher probability of rat encounter
- plague in village increases due to Dr being gone for so long
If Leave:
- Go to scene menu
# Village Shop Scene
Options:
- Gather Ingredients
- Leave
If Gather:
- some random shop ingredients available
- Higher rat encounter chance
Options:
- Gather More
- Leave
If Gather More:
- higher risk 
- plague in village increase a bit due to Dr being away for so long
If Leave:
- Go to scene menu
# Brewing Scene
Options:
- Select Ingredients to Brew Potion
- Leave
If Select Ingredients:
- select combination
    If correct combination:
    - Potion added to Potion Stock
    If incorrect:
    - Ingredients lost (maybe)
    - No potion created
Options: 
- Brew Potion Again
- Leave
If Brew again:
- repeat ingredient select and options
- higher village plague level
If Leave:
- Go to scene menu
# Chapel Scene (possibly add something player can do to decrease plague rates)
Informational only.
Displays:
- Number of infected villagers
- Severity levels
Option:
- Leave
# Treat Villagers Scene (the streets or homes)
Options:
- Select Villager
- Dr Elixir
- Leave
If Select Villager:
- Choose Potion
- Apply treatment
- plague level decreases 
- Dr health decreases due to exposure
    If correct potion:
    - Villager saved
    - VillagePlagueLevel decreases
    If incorrect:
    - Villager Dies
    - VillagePlagueLevel increases
    Option:
    - Leave
    - Select Another Villager
If Dr Elixir:
- dr health increases 
- village health stays the same or betters
If Leave:
- Go to menu
# Medical Bag Scene
Displays:
- Inventory
- PotionStock
- DoctorInfection %
- Known recipes
No Branching
# End of Day (EOD)
Triggered when player selects "End Day".
System Calculates:
- Untreated infected worsen
- VillagePlagueLevel adjusts
- DoctorInfection increases slightly
- Rat frequency recalculated
Displays:
- Villagers Saved Today
- Total Alive
- Plague %
- Doctor Infection %
# Ending Conditions
## Ending A – Village Saved For Today
Conditions:
- VillagePlagueLevel < 10%
- DoctorInfection < 50%
## Ending B – Doctor Dies, Village Survives
Conditions:
- VillagePlagueLevel < 20%
- DoctorInfection ≥ 100%
## Ending C – Village Collapses
Conditions:
- VillagePlagueLevel ≥ 98%
OR
- VillagersAlive < 25%
## Ending D – Mutual Destruction (moves on to see another day)
Conditions:
- VillagePlagueLevel ≥ 80%
- DoctorInfection ≥ 80%
## Ending E – Uncertain Fate
Condition:
- Day limit reached (example: Day 10)
- Plague unresolved





## Scene Dialgue

## INGREDIENT GATHERING
(in a forest) (in village shop)
Story: You enter the forest to gather ingredients. You search for herbs needed to brew the potions.
Or
Story: Here in the village, you will find many useful ingredients, however rats you may also find. Tread carefully…
Player Choice:
Which ingredient do you search for?
1.    Blackroot Herb
2.    Silverleaf
3.    Bitter Mushrooms
(based on choice rat encounter may occur)

## RAT ENCOUNTER
Story: Suddenly — rats burst from the shadows!
Player Choice:
1.    Run away
2.    Attempt to scare them
3.    Stand still and observe
Rat Outcome - 
•    Running → Moderate infection risk
•    Scaring → Low risk
•    Standing still → High risk
Story: (if infected): You feel sharp pain. A bite. Your chances of survival have decreased.

##POTION BREWING
Story: You begin brewing a potion. The mixture bubbles. Timing and ingredients matter. (five potions are they going to have varying effectiveness?)

##TREATING VILLAGERS
(the village) 
Story: You administer the potion.
SURVIVAL CALCULATION (Hidden)
Survival chance depends on:
•    Villager condition
•    Player infection status
•    rat encounters and their outcome
•    potion effectiveness
Success Outcome:
Story: The villager’s heath betters, you have healed him
Failure Outcome:
Story: The villagers grow weaker. And dies. You have failed to heal him.
(How does player decide what villagers to treat first? does choice effect outcome?)

##SUMMARY EOD
(Night falls over the village)
Story: The day comes to an end. Some villagers survived. Others did not. Your own health weighs heavily on you.

Survival Report (Daily?)
•    Villagers treated: X
•    Successful cures: X
•    Rat encounters: X
•    Your infection risk: LOW / MEDIUM / HIGH
•    Odds of Survival: %


CONCLUSIONS
Good – Story: Against all odds, the plague recedes.
Mod – Story: The village survives — but at great cost.
Bad – Story: The plague claims the village… and you. No cure was enough.


Random Endings:
CONCLUSIONS
Good – Story: Against all odds, the plague recedes.
- 
- 
Mod – Story: The village survives — but at great cost.
- 
- 
Bad – Story: The plague claims the village… and you. No cure was enough.
- 
- 
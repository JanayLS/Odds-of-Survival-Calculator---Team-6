# Menu/Arrival Scene Structure
This document explains:
- The structure/gameplay flow of the Menu and Intro/Arrival Scene
- Current Features 
- Features to be Added

## Menu Scene
Start Button -> Transition to Arrival Scene (First Scene of Game)

## Intro/Arrival Scene Gameplay Flow and Elements
- Intro Villager gives dialogue about the plague
- 3 Choices with 2 Sub-Choices Each:
  - **Choice 1: Ask about Villagers**
    - Heal Villager in Home
    - Pray at Chapel
  - **Choice 2: Ask about Rats**
    - Fight Rat
    - Shop for Weapons/Rat Poison
  - **Choice 3: Check Supplies**
    - **When chosen, Inventory Button Appears**. In future development, a few starter ingredients will be randomly generated and stored in Inventory panel.
    - Search Forest for Ingredients
    - Brew Ingredients

## Possible Features to Add
- When Player chooses **Choice 1 (Ask about Villagers)**, a **list of sick villagers** could be randomly generated, along with an overall **Village Infection Rate** which will be based on how many villagers have been healed. (So for example, Village Infection Rate starts at 100%. Let's say you have 5 sick villagers. When one villager is healed, Village Infection rate would go down to 80%, and so on.)
- When Player chooses **Choice 2 (Ask about Rats)**, a **list of rat enemies** could be randomly generated, so the player will know how many rats need to be killed to stop the Plague.

## Workflow for Modifying Menu/Arrival Scene
If anyone wants to modify the Menu/Arrival Scene:
- Create a new branch off of frontend branch 
- Make changes
- Submit PR to frontend branch (not main) so changes can be reviewed before merging to frontend branch
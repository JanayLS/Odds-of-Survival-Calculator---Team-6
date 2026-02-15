## Deliverable Tasks

### What is the Sprint 1 Deliverable?

The **deliverable for Sprint 1** is to give this Intro/Arrival scene **basic functionality**. By the end of Sprint 1, we should have
- The **Plague Doctor fading into the scene**, as if he is arriving
- **Assets integrated** in the scene in a **cohesive style**
- A **dialog box that is interactive** and changes with the story, with animated text
- The first **Player Choice** with 3 options:
  1. Ask about the sick villagers
  2. Ask about the rats
  3. Inspect your medical supplies 
- **Responses from the Villager/Story Narration** which change depending on the Player Choice

## Important Note about Tasks!
**These tasks are my proposed idea of the Sprint 1 Plan to help us coordinate our work. Remember that this is flexible and collaborative, so feel free to suggest adjustments!** Also make sure to read each person's tasks, so we all know what the others are working on and we can work together effectively.

### Noah's Tasks (Visual Assets/Scene Design)
1. **Plague Doctor** Choose the one you like the most! Or we can all decide together
2. **Infected Village Background**  This version of the village should look darker and show signs of disease/decay because it is the "infected village".
3. **Worried Villager #1 (Man)** (The first villager our Plague Doctor will talk to in the scene)
4. **Worried Villager #2 (Woman)** who will answer when the player picks **Choice 1** (see Choice 1 in `intro-arrival-story-script.md` in this folder)
5. **Smaller sick background villagers and rats** to go in the background for when the Player chooses **Choice 2** (see Choice 2 in `intro-arrival-story-script.md` in this folder)
6. **Plague Doctor's Bag with a Few Basic Supplies** for when the Player chooses **Choice 3** (see Choice 3 in `intro-arrival-story-script.md` in this folder). **IMPORTANT!** His bag will be our **inventory layout**, so we need a design that keeps that in mind. Make his **supplies assets as separate items** that can be added or discarded from the inventory.
7. Make sure that the backgrounds of these assets are **transparent** (except for the village which is the main background), so that they will integrate smoothly into the scene.
8. In **GitHub** in the **frontend** branch, create an **Images** folder. Then create an **Assets** subfolder inside that. Then inside that create **separate subfolders for each asset type** (Backgrounds, NPCs, Rats, Potions, Ingredients, etc.). Start organizing the assets into those folders.
9. Make sure that the assets you choose for the scene **fit together visually** and that nothing looks out of place.
10. Feel free to experiment with **code for menu design and styles for other visual elements** so that they fit with the style of the scene!
11. Keeping up with the scenes Maria is working on is a great way to get **inspiration** for assets we will need in future Sprints 


### Maria's Tasks (Narrative/Branch Design)
1. In **GitHub** in the **frontend** branch, create a **Story** folder. Put the **original story** document you created inside there. Then, create separate **subfolders** for each scene type (Intro/Arrival, Ingredients Gathering, Rat Encounter, Potion Brewing, etc.). This is where we'll keep story, choice branches, item descriptions, enemy types, NPC names/types etc. for each scene.
2. For our Intro/Arrival scene, we need **branch options for what the next scene will be**, which will depend on a choice the player makes at the end of the scene. For each of the 3 options in the intro scene (refer to the **"Player Choice 1"** section in our `intro-arrival-story-script` file), script **2 different scene options** for each choice. This way, there will be a total of 6 possible scenes to move to next. *(Example: Choice 3: Inspect Medical Supplies might give 2 choices like *"Explore the forest for ingredients"* and *"Go to the village shop for ingredients"*.)*
3. The original story document has a lot of **helpful questions** such as whether potions have varying effectiveness, how the player decides which villagers to treat first, etc. Inside the GitHub **Story** folder, create a document called **Questions** and begin sketching out ideas for how these systems will work in our game. 
4. Looking at the assets Noah has generated is a great way to get more **inspiration** for story/scene/character/item details

### My (Zoe) Tasks (Frontend Interactivity/Progression Logic)
1. Implement the story and assets into an **interactive, responsive scene** with a clear flow. Make sure that layout and assets maintain aspect ratio and position with different screen sizes.
2. Implement **interactivity logic** to progress dialogue, respond to player choices, and determine what the next scene after the Intro/Arrival scene will be based on the choice.
3. Begin working on a prototype for **client-side (not hooked up to backend yet) probability logic** that will drive the story forward with random outcomes.


### Final Note
Make sure to **keep doing the daily check ins and keeping the rest of frontend updated on your progress in the Discord.** Once we have this **basic functioning Intro/Arrival Scene** at the end of Sprint 1, we'll have a strong foundation for creating the rest of our scenes in Sprint 2. 

***Note:** I am also currently working on the prototype for the client-side **probability generator** which will respond to user choices and drive the story forward. I am currently unsure whether it will be implemented in this Sprint 1 deliverable or not. I will keep you guys updated on the probability generator progress.*
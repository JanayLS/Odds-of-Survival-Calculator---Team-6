### New File System for Plague Village Game 🐀📁
<br>

**How to Add Scenes (For Frontend Team)** 🐀
1. In `index.html`, scroll to the bottom where the `<script>` tags are. Add a `<script>` tag linking to your scene's js file -- make sure to keep all scene js files **under** the main script.js and data js files so everything loads in the right order.
2. Go to your scene's js file within `scenes/`. Add your scene's HTML elements into the innerHTML template literal. Don't include the HTML boilerplate, `<head>` or `<body>` tags. Only include the content that belongs in your scene's container, not the scene container `<div>` itself. 
3. Make sure any shared IDs and Class names in your HTML match the names already used in `styles.css` and `script.js`. Do not redeclare global variables/functions that are already in script.js. If needed, rename your local variables to avoid conflicts with script.js
4. Include your scene-specific JavaScript below the innerHTML content in your js file.  
5. In `styles.css`, scroll down and you will find a section for your scene. ONLY include scene specific CSS -- if an element has already been defined in global CSS above, that element already has a style.
6. Test that your scene loads correctly and that navigation works before submitting a pull request!
7. The process of integrating the scenes might be a little bumpy at first and that's okay! If there are issues, send me a message in the Discord -- we can go over everything at the meeting on Friday.

**Benefits of the New File System** 🐀
- More organized, modular, maintainable structure
- Different file types (scenes, images, music, data, etc.) have their own dedicated folders now. 
- Easier to find and organize scenes, data, and assets.
- `index.html`, `styles.css`, and `script.js` control the main page elements, styles, and interactivity, which maintains simplicity and  modularity while avoiding repetitive code.
- `showScene()` in `script.js` easily switches between scenes, so now we can move between different scenes in the game.
- Inventory will persist through all scenes because it is stored in our main js file `script.js`.
- Other game data (# of rats to defeat, # of sick villagers, Plague infection status, money, etc.) will also persist for the same reason.
- Will simplify backend/frontend integration because we can store player and game data within our data files as JSON objects.


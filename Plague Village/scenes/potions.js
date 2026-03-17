const potionsScene = document.getElementById("potionsScene");

potionsScene.innerHTML = `
        <img id="plagueDoctor" src="images/characters/plagueDoctor.png">

        
        <!-- Recipe Book Button -->
        <button id="recipeBookBtn">Recipe Book</button>

       

    <!-- Recipe Book Screen -->
    <div id="recipeBookScreen" class="hidden">
        <button id="closeRecipeBookBtn">Close Book</button>

        <div class="book-wrapper">
            <img src="images/misc-images/recipe-book.png" id="recipeBookImg">

            <!-- Left Page -->
            <div class="book-page left-page">
                <!-- Healing Tonic Recipe -->
                <div class="recipe-entry">
                    <h3 class="recipe-title">Healing Tonic</h3>

                    <div class="potion-display">
                        <img src="images/potions/healing-tonic.png">
                    </div>

                    <div class="ingredient-row">
                        <div class="ingredient">
                            <img src="images/ingredients/silverleaf.png">
                            <span>Silverleaf</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/yarrow.png">
                            <span>Yarrow</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/mint.png">
                            <span>Mint</span>
                        </div>
                    </div>
                </div>
                <!-- Fever Suppresant Recipe -->
                <div class="recipe-entry">
                    <h3 class="recipe-title">Fever Suppresant</h3>

                    <div class="potion-display">
                        <img src="images/potions/fever-suppressant.png">
                    </div>

                    <div class="ingredient-row">
                        <div class="ingredient">
                            <img src="images/ingredients/thyme.png">
                            <span>Thyme</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/hawthorne.png">
                            <span>Hawthorne</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/mint.png">
                            <span>Mint</span>
                        </div>
                    </div>
                </div>
                <!-- Plague Concoction Recipe -->
                <div class="recipe-entry">
                    <h3 class="recipe-title">Plague Concoction</h3>

                    <div class="potion-display">
                        <img src="images/potions/plague-concoction.png">
                    </div>

                    <div class="ingredient-row">
                        <div class="ingredient">
                            <img src="images/ingredients/bitter-mushroom.png">
                            <span>Bitter Mushroom</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/molded-bark.png">
                            <span>Molded Bark</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/charcoal-powder.png">
                            <span>Charcoal Powder</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="book-page right-page">
                <!-- Ash Remedy -->
                <div class="recipe-entry">
                    <h3 class="recipe-title">Ash Remedy</h3>

                    <div class="potion-display">
                        <img src="images/potions/ash-remedy.png">
                    </div>

                    <div class="ingredient-row">
                        <div class="ingredient">
                            <img src="images/ingredients/bone-ash.png">
                            <span>Bone Ash</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/garlic-bulb.png">
                            <span>Garlic Bulbs</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/charcoal-powder.png">
                            <span>Charcoal Powder</span>
                        </div>
                    </div>
                </div>
                <!-- Elixir Recipe -->
                <div class="recipe-entry">
                    <h3 class="recipe-title">Elixir</h3>

                    <div class="potion-display">
                        <img src="images/potions/elixir.png">
                    </div>

                    <div class="ingredient-row">
                        <div class="ingredient">
                            <img src="images/ingredients/silverleaf.png">
                            <span>Silverleaf</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/garlic-bulb.png">
                            <span>Garlic Bulbs</span>
                        </div>

                        <div class="ingredient">
                            <img src="images/ingredients/charcoal-powder.png">
                            <span>Charcoal Powder</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
`
// Recipe Book Button
const recipeBookBtn = document.getElementById('recipeBookBtn')
const closeRecipeBookBtn = document.getElementById('closeRecipeBookBtn')
const recipeBookScreen = document.getElementById('recipeBookScreen')
const bookSound = new Audio('sound-effects/misc-sounds/page-turn.wav')

// Recipe Book Button
recipeBookBtn.addEventListener("click", () => {
    recipeBookScreen.classList.remove("hidden");

    bookSound.currentTime = 0;
    bookSound.play();
    bookSound.volume = 1;
});

closeRecipeBookBtn.addEventListener("click", () => {
    recipeBookScreen.classList.add("hidden");

    bookSound.currentTime = 0;
    bookSound.play();
    bookSound.volume = 1;
})
// Lets user turn music on or off with Music On button
document.getElementById('turn-music-on').addEventListener("click", () => {
    document.getElementById("bgm").play();
})

// Makes sure the assets have the same aspect ratios regardless of browser zoom in/out
function resizeGame() {
    const game = document.getElementById('scene');
    const scale = Math.min(
        window.innerWidth / 1920,
        window.innerHeight / 1080
    );
    game.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', resizeGame);
resizeGame();
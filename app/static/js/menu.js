document.addEventListener("DOMContentLoaded", () => {
  const music = document.getElementById("menu-music");
  const muteBtn = document.getElementById("btn-mute");

  if (!music || !muteBtn) {
    console.error("Missing #menu-music or #btn-mute");
    return;
  }

  music.volume = 0.35;

  // Restore saved mute state
  const savedMuted = localStorage.getItem("menuMuted");
  if (savedMuted !== null) music.muted = savedMuted === "true";
  muteBtn.textContent = music.muted ? "🔇" : "🔊";
  muteBtn.title = music.muted ? "Unmute" : "Mute";

  // Start playback on first user gesture (reliable)
  const startMusicOnce = async () => {
    try {
      await music.play();
    } catch (e) {
      console.warn("Music play blocked until user gesture:", e?.name || e);
    }
  };
  window.addEventListener("click", startMusicOnce, { once: true });
  window.addEventListener("keydown", startMusicOnce, { once: true });

  // Toggle mute
  muteBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    music.muted = !music.muted;
    localStorage.setItem("menuMuted", String(music.muted));

    muteBtn.textContent = music.muted ? "🔇" : "🔊";
    muteBtn.title = music.muted ? "Unmute" : "Mute";

    // If unmuting, try to start audio now
    if (!music.muted) {
      try {
        await music.play();
      } catch (err) {
        console.warn("Unmute play blocked:", err?.name || err);
      }
    }
  });
});
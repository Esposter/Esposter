<script setup lang="ts">
import music from "#src/data/login/music.json";
import { useEventListener } from "@vueuse/core";
import { createMusicPlayer } from "genshin-engine";

// The login's music, rendering nothing: its playlist from the start, looping as the game's does, for as long as the
// Screen shows. A browser holds sound until the page has had a click or a key, so on a page that has had neither the
// Music waits for the first pointer or key press anywhere on the window, and starts there from its beginning
let close: (() => Promise<void>) | undefined;
onMounted(() => {
  const context = new AudioContext();
  const player = createMusicPlayer(context, music);
  player.start();
  if (context.state === "suspended")
    for (const type of ["pointerdown", "keydown"] as const)
      useEventListener(
        window,
        type,
        async () => {
          await context.resume();
        },
        { once: true },
      );
  close = async () => {
    player.stop();
    await context.close();
  };
});
onUnmounted(async () => {
  await close?.();
});
</script>

<template></template>

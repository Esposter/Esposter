<script setup lang="ts">
import music from "#src/data/login/music.json";
import sounds from "#src/data/login/sounds.json";
import { LOGIN_DOOR_SOUND_DELAY_MS } from "#src/services/login/constants";
import { useEventListener } from "@vueuse/core";
import { createMusicPlayer, createSoundEffectBuffer } from "genshin-engine";

interface Props {
  // The door has been clicked open, which plays its sound once
  isDoorOpened?: true;
}

const { isDoorOpened } = defineProps<Props>();
// The login's music, rendering nothing: its playlist from the start, looping as the game's does, for as long as the
// Screen shows, and the door's sound once the door opens, both through one context. The browser's autoplay policy may
// Start the context suspended, and then the music waits for the first pointer or key press anywhere on the window, and
// Starts there from its beginning
let close: (() => Promise<void>) | undefined;
let playDoorSound: (() => void) | undefined;
onMounted(() => {
  const context = new AudioContext();
  const player = createMusicPlayer(context, music);
  player.start();
  const doorSound = createSoundEffectBuffer(context, sounds.door);
  playDoorSound = () => {
    const source = new AudioBufferSourceNode(context, { buffer: doorSound });
    source.connect(context.destination);
    source.start(context.currentTime + LOGIN_DOOR_SOUND_DELAY_MS / 1000);
  };
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
watch(
  () => isDoorOpened,
  (newIsDoorOpened) => {
    if (newIsDoorOpened) playDoorSound?.();
  },
);
onUnmounted(async () => {
  await close?.();
});
</script>

<template></template>

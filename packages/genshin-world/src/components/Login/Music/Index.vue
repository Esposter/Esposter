<script setup lang="ts">
import type { LoginSounds } from "#src/models/login/LoginSounds";
import type { Music, MusicPlayer } from "genshin-engine";

import {
  LOGIN_DOOR_SOUND_DELAY_MS,
  LOGIN_EFFECTS_COMPRESSOR_OPTIONS,
  LOGIN_MASTER_LIMITER_OPTIONS,
} from "#src/services/login/constants";
import { loadMusicRecordings } from "#src/services/login/music/loadMusicRecordings";
import { getResultAsync } from "@esposter/shared";
import { useEventListener } from "@vueuse/core";
import { createMusicPlayer, createSoundEffectBuffer } from "genshin-engine";

interface Props {
  // The door has been clicked open, which plays its sound once
  isDoorOpened?: true;
  // The login's music as its fit and the parity loops solved it: its playlist, its instruments and its voices
  music: Music;
  // Where the music's recordings are served from, which its voices play over their synthesized notes
  musicRecordingBaseUrl: string;
  // The login's sounds by their names, the door's among them, as its fit matched them among the game's own
  sounds: LoginSounds;
}

const { isDoorOpened, music, musicRecordingBaseUrl, sounds } = defineProps<Props>();
// The login's music, rendering nothing: its playlist from the start, looping as the game's does, for as long as the
// Screen shows, and the door's sound once the door opens through the effects bus's compressor and the master's limiter
// As the game's mix passes it, both through one context. The browser's autoplay policy may
// Start the context suspended, and then the music waits for the first pointer or key press anywhere on the window, and
// Starts there from its beginning. The music starts once its recordings are decoded, or without them where they cannot
// Be fetched, unless the screen has gone by then
let close: (() => Promise<void>) | undefined;
let playDoorSound: (() => void) | undefined;
onMounted(() => {
  const context = new AudioContext();
  let isClosed = false;
  let player: MusicPlayer | undefined;
  const start = (recordingBufferMap: ReadonlyMap<string, AudioBuffer>): void => {
    if (isClosed) return;
    player = createMusicPlayer(context, music, recordingBufferMap);
    player.start();
  };
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and the mount has nothing to await it
  getResultAsync(() => loadMusicRecordings(context, music, musicRecordingBaseUrl)).match(start, (error) => {
    console.error(error);
    start(new Map());
  });
  const doorSound = createSoundEffectBuffer(context, sounds.door);
  const effectsBus = new DynamicsCompressorNode(context, LOGIN_EFFECTS_COMPRESSOR_OPTIONS);
  effectsBus.connect(new DynamicsCompressorNode(context, LOGIN_MASTER_LIMITER_OPTIONS)).connect(context.destination);
  playDoorSound = () => {
    const source = new AudioBufferSourceNode(context, { buffer: doorSound });
    source.connect(effectsBus);
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
    isClosed = true;
    player?.stop();
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

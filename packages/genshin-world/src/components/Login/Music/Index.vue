<script setup lang="ts">
import type { LoginSounds } from "#src/models/login/LoginSounds";
import type { Music, MusicPlayer } from "genshin-engine";

import { VolumeSetting } from "#src/models/menu/VolumeSetting";
import {
  LOGIN_DOOR_FORMING_ATTACK_MS,
  LOGIN_DOOR_FORMING_HOLD_MS,
  LOGIN_DOOR_FORMING_LEVEL_DECIBELS,
  LOGIN_DOOR_FORMING_RELEASE_MS,
  LOGIN_DOOR_SOUND_DELAY_MS,
  LOGIN_EFFECTS_COMPRESSOR_OPTIONS,
  LOGIN_MASTER_LIMITER_OPTIONS,
} from "#src/services/login/constants";
import { loadMusicRecordings } from "#src/services/login/music/loadMusicRecordings";
import { getStoredChannelGain } from "#src/services/menu/getStoredChannelGain";
import { getResultAsync } from "@esposter/shared";
import { useEventListener } from "@vueuse/core";
import { createMusicPlayer, createNoiseBuffer, createSoundEffectBuffer } from "genshin-engine";

interface Props {
  // Where the hosted game data is read from, whose lock names the music's recordings, which its voices play over their
  // Synthesized notes
  gameDataBaseUrl: string;
  // The door has begun to form, which plays its low layer once
  isDoorForming: boolean;
  // The door has been clicked open, which plays its sound once
  isDoorOpened: boolean;
  // The login's music as its fit and the parity loops solved it: its playlist, its instruments and its voices
  music: Music;
  // The login's sounds by their names, the door's among them, as its fit matched them among the game's own
  sounds: LoginSounds;
}

const { gameDataBaseUrl, isDoorForming, isDoorOpened, music, sounds } = defineProps<Props>();
// The login's music, rendering nothing: its playlist from the start, looping as the game's does, for as long as the
// Screen shows. The door's layer plays as the door forms, and its sound once the door opens, through the effects bus's
// Compressor and the master's limiter as the game's mix passes them, all through one context. The browser's autoplay
// Policy may start the context suspended, and then the music waits for the first pointer or key press anywhere on the
// Window, and starts there from its beginning. The music starts once its recordings are decoded, or without them where
// They cannot be fetched, unless the screen has gone by then. Each channel passes the gain its stored volume sets,
// As the Settings Screen keeps it
let close: (() => Promise<void>) | undefined;
let playDoorForming: (() => void) | undefined;
let formingEnded: Promise<void> | undefined;
let playDoorSound: (() => void) | undefined;
let doorEnded: Promise<void> | undefined;
onMounted(() => {
  const context = new AudioContext();
  let isClosed = false;
  let player: MusicPlayer | undefined;
  const musicBus = new GainNode(context, { gain: getStoredChannelGain(VolumeSetting.Music) });
  musicBus.connect(context.destination);
  const start = (recordingBufferMap: ReadonlyMap<string, AudioBuffer>): void => {
    if (isClosed) return;
    player = createMusicPlayer(context, music, recordingBufferMap, musicBus);
    player.start();
  };
  getResultAsync(() => loadMusicRecordings(context, music, gameDataBaseUrl)).match(start, (error) => {
    console.error(error);
    start(new Map());
  });
  const doorSound = createSoundEffectBuffer(context, sounds.door);
  // The forming's layer is the one octave band of our own noise at its level, the 63 hertz band
  const formingNoise = createNoiseBuffer(context, [10 ** (LOGIN_DOOR_FORMING_LEVEL_DECIBELS / 20)]);
  const effectsBus = new DynamicsCompressorNode(context, LOGIN_EFFECTS_COMPRESSOR_OPTIONS);
  effectsBus.connect(new DynamicsCompressorNode(context, LOGIN_MASTER_LIMITER_OPTIONS)).connect(context.destination);
  const sfxBus = new GainNode(context, { gain: getStoredChannelGain(VolumeSetting.Sfx) });
  sfxBus.connect(effectsBus);
  playDoorForming = () => {
    const source = new AudioBufferSourceNode(context, { buffer: formingNoise ?? null, loop: true });
    const envelope = new GainNode(context, { gain: 0 });
    source.connect(envelope).connect(sfxBus);
    // Silent at its start, an attack to full, a hold, then a release to silence, all scheduled on the context's clock
    const startedAt = context.currentTime;
    const attackEnd = startedAt + LOGIN_DOOR_FORMING_ATTACK_MS / 1000;
    const holdEnd = attackEnd + LOGIN_DOOR_FORMING_HOLD_MS / 1000;
    const end = holdEnd + LOGIN_DOOR_FORMING_RELEASE_MS / 1000;
    envelope.gain
      .setValueAtTime(0, startedAt)
      .linearRampToValueAtTime(1, attackEnd)
      .setValueAtTime(1, holdEnd)
      .linearRampToValueAtTime(0, end);
    source.start(startedAt);
    source.stop(end);
    formingEnded = new Promise<void>((resolve) => {
      source.addEventListener("ended", () => resolve(), { once: true });
    });
  };
  playDoorSound = () => {
    const source = new AudioBufferSourceNode(context, { buffer: doorSound });
    source.connect(sfxBus);
    source.start(context.currentTime + LOGIN_DOOR_SOUND_DELAY_MS / 1000);
    doorEnded = new Promise<void>((resolve) => {
      source.addEventListener("ended", () => resolve(), { once: true });
    });
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
    // The door's layer and sound outlast the hand-off to the loading screen, so the context closes once they have ended
    await Promise.all([formingEnded, doorEnded]);
    await context.close();
  };
});
watch(
  () => isDoorForming,
  (newIsDoorForming) => {
    if (newIsDoorForming) playDoorForming?.();
  },
);
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

<script setup lang="ts">
import type { GameText } from "genshin-text";

import { PAIMON_EMBLEM_LAYERS } from "#src/services/hud/constants";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
const emit = defineEmits<{ press: [] }>();
</script>

<template>
  <!-- The HUD's corner button that opens the Paimon menu, as Escape does: Paimon's emblem bare over the world, as the
       Game draws it, named for a screen reader since it shows the emblem alone -->
  <button class="paimon-button" type="button" :aria-label="gameText[GameTextKey.Paimon]" @click="emit('press')">
    <svg class="emblem" aria-hidden="true" viewBox="0 0 360 360">
      <path v-for="{ color, path } of PAIMON_EMBLEM_LAYERS" :key="color" fill-rule="evenodd" :fill="color" :d="path" />
    </svg>
  </button>
</template>

<style scoped>
.paimon-button {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: none;
  cursor: inherit;
  pointer-events: auto;
}

/* The traced box as it stands on the 1080 high still, 75 canvas units square from 8.67 left of the button's rect and
   10.33 above it, so the emblem spans the rect's width and its cape hangs below, as the game's does */
.emblem {
  position: absolute;
  top: calc(var(--canvas-unit) * -10.33);
  left: calc(var(--canvas-unit) * -8.67);
  width: calc(var(--canvas-unit) * 75);
  height: calc(var(--canvas-unit) * 75);
  pointer-events: none;
}
</style>

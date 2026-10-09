<script setup lang="ts">
import type { GameText } from "genshin-text";

import { PAIMON_MARK_PATH } from "#src/services/hud/constants";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
const emit = defineEmits<{ press: [] }>();
</script>

<template>
  <!-- The HUD's corner button that opens the Paimon menu, as Escape does, named for a screen reader since it shows a
       Mark alone -->
  <button class="paimon-button" type="button" :aria-label="gameText[GameTextKey.Paimon]" @click="emit('press')">
    <svg class="mark" aria-hidden="true" viewBox="0 0 90 90">
      <path fill-rule="evenodd" :d="PAIMON_MARK_PATH" />
    </svg>
  </button>
</template>

<style scoped>
/* Provisional: the button's size and colours, measured off a recording of the English PC Client's world HUD */
.paimon-button {
  position: relative;
  width: calc(var(--unit) * 64);
  height: calc(var(--unit) * 64);
  padding: 0;
  border: calc(var(--unit) * 3) solid rgb(236 229 216 / 0.9);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, #3b5f8f 0 35%, #1f3553 100%);
  box-shadow: 0 0 calc(var(--unit) * 4) rgb(0 0 0 / 0.4);
  cursor: inherit;
  pointer-events: auto;
}

/* Provisional: Paimon's mark's place and fill, traced off the same recording and to be measured against it */
.mark {
  position: absolute;
  inset: 0;
  width: 84%;
  height: 84%;
  margin: auto;
  fill: #fdf8ec;
  pointer-events: none;
}
</style>

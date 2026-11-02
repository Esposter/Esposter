<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the controls cannot be used at this moment
  isActionLocked: boolean;
  // Whether the player has armed elemental tuning, which the synchro shows as pressed
  isTuning: boolean;
}

const { gameText, isActionLocked, isTuning } = defineProps<Props>();
const emit = defineEmits<{ toggleTuning: [] }>();
</script>

<template>
  <!-- The synchro that arms elemental tuning -->
  <button
    class="synchro"
    :aria-pressed="isTuning"
    :disabled="isActionLocked"
    type="button"
    @click="emit('toggleTuning')"
  >
    {{ gameText[GameTextKey.GcgElementalTuning] }}
  </button>
</template>

<style scoped src="../../../../../styles/gcgBoardButton.css"></style>

<style scoped>
.synchro {
  position: absolute;
  top: calc(var(--unit) * 780);
  left: calc(var(--unit) * 1420);
}
</style>

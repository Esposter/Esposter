<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the player is choosing the dice a Toss-Up being played rerolls
  isChoosingReroll: boolean;
  // Whether the player is the duel's winner, which an ended duel's confirm leaves with
  isPlayerWinner: boolean;
  // The duel's phase, which names the bar's variant
  phase: GcgPhase;
}

defineProps<Props>();
const emit = defineEmits<{
  addRerollGroup: [];
  clearSelection: [];
  leave: [won: boolean];
  playRerollChoice: [];
  prepare: [];
  reroll: [];
}>();
</script>

<template>
  <!-- The confirm bar under the board's right edge, one variant for each phase and the Toss-Up being chosen -->
  <div v-if="phase === GcgPhase.Preparation" class="confirm">
    <button type="button" @click="emit('prepare')">{{ gameText[GameTextKey.GcgConfirm] }}</button>
  </div>
  <div v-else-if="phase === GcgPhase.Roll" class="confirm">
    <button type="button" @click="emit('reroll')">{{ gameText[GameTextKey.GcgReroll] }}</button>
  </div>
  <div v-else-if="phase === GcgPhase.Ended" class="confirm">
    <button type="button" @click="emit('leave', isPlayerWinner)">{{ gameText[GameTextKey.GcgConfirm] }}</button>
  </div>
  <div v-else-if="isChoosingReroll" class="confirm">
    <button type="button" @click="emit('addRerollGroup')">{{ gameText[GameTextKey.GcgReroll] }}</button>
    <button type="button" @click="emit('playRerollChoice')">{{ gameText[GameTextKey.GcgConfirm] }}</button>
    <button type="button" @click="emit('clearSelection')">{{ gameText[GameTextKey.Cancel] }}</button>
  </div>
</template>

<style scoped src="../../../../styles/gcgBoardButton.css"></style>

<style scoped>
/* The buttons take their places in the row, so a choice's Reroll, Confirm and Cancel never stack on one another */
.confirm {
  position: absolute;
  top: calc(var(--unit) * 860);
  left: calc(var(--unit) * 1420);
  display: flex;
  gap: calc(var(--unit) * 16);
}
</style>

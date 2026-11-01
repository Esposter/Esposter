<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the controls cannot be used at this moment
  isActionLocked: boolean;
  // Whether the player is the one acting, which the now-acting line names
  isPlayerTurn: boolean;
  // Whether the player has armed elemental tuning, which the synchro shows as pressed
  isTuning: boolean;
  // The round's counter in the reader's language
  roundLabel: string;
}

const { gameText, isActionLocked, isPlayerTurn, isTuning, roundLabel } = defineProps<Props>();
const emit = defineEmits<{ declareRoundEnd: []; toggleTuning: [] }>();
</script>

<template>
  <!-- The end-round token with the round's counter beside it, the now-acting line under the player's plate, and the synchro
       that arms elemental tuning -->
  <button
    class="end-round"
    :aria-label="gameText[GameTextKey.GcgEndRound]"
    :disabled="isActionLocked"
    type="button"
    @click="emit('declareRoundEnd')"
  />
  <div class="round">{{ roundLabel }}</div>
  <div v-if="isPlayerTurn" class="acting">{{ gameText[GameTextKey.GcgNowActing] }}</div>
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

<style scoped src="../../../../styles/gcgBoardButton.css"></style>

<style scoped>
/* The end-round token is the frame's gold coin in its bronze bevel, 128 across, the coin's gold 76 inside a dark rim */
.end-round {
  position: absolute;
  top: calc(var(--unit) * 477);
  left: calc(var(--unit) * 16);
  width: calc(var(--unit) * 128);
  height: calc(var(--unit) * 128);
  border: calc(var(--unit) * 20) solid #6e553b;
  border-radius: 50%;
  background: #e6a83e;
  box-shadow: inset 0 0 0 calc(var(--unit) * 6) #4f3524;
}

.round {
  position: absolute;
  top: calc(var(--unit) * 610);
  left: 0;
  width: calc(var(--unit) * 160);
  color: #f6e3a1;
  font-size: calc(var(--unit) * 20);
  text-align: center;
}

.acting {
  position: absolute;
  top: calc(var(--unit) * 1024);
  left: calc(var(--unit) * 146);
  color: #f6e3a1;
  font-size: calc(var(--unit) * 20);
}

.synchro {
  position: absolute;
  top: calc(var(--unit) * 780);
  left: calc(var(--unit) * 1420);
}
</style>

<script setup lang="ts">
import type { GameText } from "genshin-text";

import { LoginStatusStep } from "#src/models/login/LoginStatusStep";
import { LoginStatusStepGameTextKeyMap } from "#src/services/login/LoginStatusStepGameTextKeyMap";
import { ORNAMENT_MIDDLE_PATH, ProgressBar } from "genshin-interface";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // How far loading has gone, from 0 to 1
  progress: number;
  step: LoginStatusStep;
}

const { gameText, progress, step } = defineProps<Props>();
// The game's status at the foot of its login screen as it prepares: a line of text, then from loading on its share
// Done to two places, over the ornament's double diamond while the game loads and over the progress bar while data
// Does. Once loading is done the words go, the bar folds into its diamond under the full share, and then the whole row
// Fades, leaving the flight's last stretch bare before the door rises, as the English recording's does
const isDone = computed(() => step === LoginStatusStep.LoadingData && progress >= 1);
const percentText = computed(() =>
  step === LoginStatusStep.LoadingGame ? "0.00%" : `${(Math.min(progress, 1) * 100).toFixed(2)}%`,
);
</script>

<template>
  <div :class="['login-status', { done: isDone }]" role="status">
    <p class="text">{{ isDone ? "" : gameText[LoginStatusStepGameTextKeyMap[step]] }}</p>
    <template v-if="step === LoginStatusStep.LoadingGame || step === LoginStatusStep.LoadingData">
      <p class="percent">{{ percentText }}</p>
      <svg v-if="step === LoginStatusStep.LoadingGame" class="mark" viewBox="0 0 480 320" aria-hidden="true">
        <path :d="ORNAMENT_MIDDLE_PATH" />
      </svg>
      <ProgressBar v-else class="bar" :is-folded="isDone" :progress />
    </template>
  </div>
</template>

<style scoped>
/* Measured from the English client's login screen at 1080 high, each line's middle over the screen's foot, in the
   Foot the game's Bottom lays out: the words 118 units up, in the middle of its 58 unit loading row (LoadingDesc), the
   Share 83 and the bar 60. Riding in the foot, they stay at the screen's bottom on any window */
.login-status {
  position: absolute;
  inset: 0;
  color: #fff;
  pointer-events: none;
  text-align: center;
}

/* The row fades over 250 ms once the bar's 250 ms fold is done: gone half a second after loading ends, as the English
   Recording at 4 frames a second shows */
.done {
  opacity: 0;
  transition: opacity 250ms linear 250ms;
}

.text,
.percent,
.mark,
.bar {
  position: absolute;
  left: 50%;
  translate: -50% 50%;
}

.text,
.percent {
  margin: 0;
  font-weight: 600;
  line-height: 1;
  text-shadow: 0 0 calc(var(--unit) * 3) rgb(0 0 0 / 0.35);
  white-space: nowrap;
}

.text {
  bottom: calc(var(--unit) * 118);
  font-size: calc(var(--unit) * 30);
}

.percent {
  bottom: calc(var(--unit) * 83);
  font-size: calc(var(--unit) * 22);
}

.mark {
  bottom: calc(var(--unit) * 60);
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 24);
  fill: #fff;
}

.bar {
  bottom: calc(var(--unit) * 60);
}
</style>

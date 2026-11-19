<script setup lang="ts">
import type { GameText } from "genshin-text";

import { LoginStatusStep } from "#src/models/login/LoginStatusStep";
import { LoginStatusStepGameTextKeyMap } from "#src/services/login/LoginStatusStepGameTextKeyMap";
import { GameButton, GameButtonKind, ORNAMENT_MIDDLE_PATH, ProgressBar } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether a pack's download stopped on a file that failed its attempts, which the foot says with a retry in place of
  // The bar's share
  isDownloadFailed: boolean;
  // How far loading has gone, from 0 to 1
  progress: number;
  step: LoginStatusStep;
}

const { gameText, isDownloadFailed, progress, step } = defineProps<Props>();
const emit = defineEmits<{ retry: [] }>();
// The game's status at the foot of its login screen as it prepares: a line of text, then from loading on its share
// Done to two places, over the ornament's double diamond while the game loads and over the progress bar while data
// Does. Once loading is done the words go, the bar folds into its diamond under the full share, and then the whole row
// Fades, leaving the flight's last stretch bare before the door rises, as the English recording's does. A download that
// Stopped puts its line in the words' place and its retry where the share is, and the bar stays at the share it reached
const isDone = computed(() => step === LoginStatusStep.LoadingData && progress >= 1);
const text = computed(() => {
  if (isDownloadFailed) return gameText[GameTextKey.ResourceDownloadFailed];
  return isDone.value ? "" : gameText[LoginStatusStepGameTextKeyMap[step]];
});
const percentText = computed(() =>
  step === LoginStatusStep.LoadingGame ? "0.00%" : `${(Math.min(progress, 1) * 100).toFixed(2)}%`,
);
</script>

<template>
  <div :class="['login-status', { done: isDone }]" role="status">
    <p class="text">{{ text }}</p>
    <GameButton v-if="isDownloadFailed" class="retry" :kind="GameButtonKind.Pill" tip="" @click="emit('retry')">
      {{ gameText[GameTextKey.Retry] }}
    </GameButton>
    <template v-if="step === LoginStatusStep.LoadingGame || step === LoginStatusStep.LoadingData">
      <p v-if="!isDownloadFailed" class="percent">{{ percentText }}</p>
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
.bar,
.retry {
  position: absolute;
  left: 50%;
  translate: -50% 50%;
}

/* The row lets clicks through, so the retry takes its own clicks where the share would sit */
.retry {
  bottom: calc(var(--unit) * 83);
  pointer-events: auto;
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

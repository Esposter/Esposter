<script setup lang="ts">
import { LoginStatusStep } from "#src/models/login/LoginStatusStep";
import { LoginStatusStepTextMap } from "#src/services/login/LoginStatusStepTextMap";
import { ORNAMENT_MIDDLE_PATH, ProgressBar } from "genshin-ui";

interface Props {
  // How far loading has gone, from 0 to 1
  progress: number;
  step: LoginStatusStep;
}

const { progress, step } = defineProps<Props>();
// The game's status at the foot of its login screen as it prepares: a line of text, then from loading on its share
// Done to two places, over the ornament's double diamond while the game loads and over the progress bar while data
// Does. Once loading is done the words go and the bar folds into its diamond under the full share
const isDone = computed(() => step === LoginStatusStep.LoadingData && progress >= 1);
const percentText = computed(() =>
  step === LoginStatusStep.LoadingGame ? "0.00%" : `${(Math.min(progress, 1) * 100).toFixed(2)}%`,
);
</script>

<template>
  <div class="login-status" role="status">
    <p class="text">{{ isDone ? "" : LoginStatusStepTextMap[step] }}</p>
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
/* Measured from the English client's login screen at 1080 high, each line's centre from the screen's middle: the words
   422 units below it, the share 457 and the bar 480 */
.login-status {
  position: absolute;
  inset: 0;
  color: #fff;
  pointer-events: none;
  text-align: center;
}

.text,
.percent {
  position: absolute;
  left: 50%;
  margin: 0;
  font-weight: 600;
  line-height: 1;
  text-shadow: 0 0 calc(var(--unit) * 3) rgb(0 0 0 / 0.35);
  translate: -50% -50%;
  white-space: nowrap;
}

.text {
  top: calc(50% + var(--unit) * 422);
  font-size: calc(var(--unit) * 30);
}

.percent {
  top: calc(50% + var(--unit) * 457);
  font-size: calc(var(--unit) * 22);
}

.mark {
  position: absolute;
  top: calc(50% + var(--unit) * 480);
  left: 50%;
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 24);
  fill: #fff;
  translate: -50% -50%;
}

.bar {
  position: absolute;
  top: calc(50% + var(--unit) * 480);
  left: 50%;
  translate: -50% -50%;
}
</style>

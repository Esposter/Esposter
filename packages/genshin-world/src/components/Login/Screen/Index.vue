<script setup lang="ts">
import type { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import type { TresRendererSetupContext } from "@tresjs/core";

import LoginInterface from "#src/components/Login/Interface/Index.vue";
import LoginScene from "#src/components/Login/Scene/Index.vue";
import { LoginStage } from "#src/models/login/LoginStage";
import { LoginStatusStep } from "#src/models/login/LoginStatusStep";
import {
  LOGIN_ARRIVE_FADE_MS,
  LOGIN_FLASH_MS,
  LOGIN_FLIGHT_MS,
  LOGIN_PROGRESS_FILL_MS,
  LOGIN_SPINNER_START_MS,
  LOGIN_STATUS_STEPS,
  LOGIN_TITLE_START_MS,
  LOGIN_WELCOME_HOLD_MS,
} from "#src/services/login/constants";
import { checkIsNestedInteraction } from "@esposter/shared";
import { TresCanvas } from "@tresjs/core";
import { useRafFn, useTimeoutFn, watchImmediate } from "@vueuse/core";
import { createGenshinRenderer, GENSHIN_TONE_MAPPING } from "genshin-engine";
import { GameScreen } from "genshin-ui";
import { PCFShadowMap } from "three";
import { unref } from "vue";

interface Props {
  // The scene alone, as the wiki's clean captures of it show it, for a reference to be scored against
  isInterfaceHidden?: true;
  playerName?: string;
  // How far loading has gone, from 0 to 1, which the bar shown and the camera's flight never run ahead of
  progress: number;
  timeOfDay: LoginTimeOfDay;
}

const { isInterfaceHidden, playerName = "Traveler", progress, timeOfDay } = defineProps<Props>();
const emit = defineEmits<{ begin: []; ready: [] }>();
// The game's login screen: the scene fades up out of white, a click on its title sets the camera flying down the
// Walkway as the game prepares, and a click on the door it arrives at lights it as the screen whitens, when `begin`
// Says the white is up. A host pins a stage with `v-model:stage` to show it held, as the parity page does
const stage = defineModel<LoginStage>("stage", { default: LoginStage.Arriving });
const isSpinnerShown = ref(false);
const isWelcomeShown = ref(false);
const statusStep = ref(LoginStatusStep.PreparingDownload);
// The share of loading shown, which runs toward loading's own no faster than the bar's fill
const shownProgress = ref(0);
// The share of the flight flown, from the title's pose at 0 to the door's at 1
const flight = ref(stage.value === LoginStage.Door || stage.value === LoginStage.Entering ? 1 : 0);
const { start: showSpinner } = useTimeoutFn(() => (isSpinnerShown.value = true), LOGIN_SPINNER_START_MS, {
  immediate: false,
});
const { start: showTitle } = useTimeoutFn(
  () => {
    isSpinnerShown.value = false;
    stage.value = LoginStage.Title;
  },
  LOGIN_TITLE_START_MS,
  { immediate: false },
);
const { start: hideWelcome } = useTimeoutFn(() => (isWelcomeShown.value = false), LOGIN_WELCOME_HOLD_MS, {
  immediate: false,
});
const statusTimeouts = LOGIN_STATUS_STEPS.map(({ ms, step }) =>
  useTimeoutFn(() => (statusStep.value = step), ms, { immediate: false }),
);
const { pause: pauseFlight, resume: flyOn } = useRafFn(
  ({ delta }) => {
    if (statusStep.value === LoginStatusStep.LoadingData)
      shownProgress.value = Math.min(shownProgress.value + delta / LOGIN_PROGRESS_FILL_MS, Math.min(progress, 1));
    flight.value = Math.min(flight.value + delta / LOGIN_FLIGHT_MS, Math.max(flight.value, shownProgress.value));
    if (flight.value < 1) return;
    pauseFlight();
    stage.value = LoginStage.Door;
  },
  { immediate: false },
);
watchImmediate(stage, (newStage) => {
  if (newStage === LoginStage.Arriving) {
    showSpinner();
    showTitle();
  } else if (newStage === LoginStage.Title) {
    isWelcomeShown.value = true;
    hideWelcome();
  } else if (newStage === LoginStage.Preparing) {
    for (const { start } of statusTimeouts) start();
    flyOn();
  }
});
const onClick = (event: MouseEvent): void => {
  if (checkIsNestedInteraction(event)) return;
  else if (stage.value === LoginStage.Title) stage.value = LoginStage.Preparing;
  else if (stage.value === LoginStage.Door) stage.value = LoginStage.Entering;
};
</script>

<template>
  <GameScreen class="login-screen" @click="(event: MouseEvent) => onClick(event)">
    <TresCanvas
      :renderer="({ canvas }: TresRendererSetupContext) => createGenshinRenderer(unref(canvas))"
      :tone-mapping="GENSHIN_TONE_MAPPING"
      shadows
      :shadow-map-type="PCFShadowMap"
    >
      <LoginScene :flight :is-door-lit="stage === LoginStage.Entering" :time-of-day @ready="emit('ready')" />
    </TresCanvas>
    <LoginInterface
      v-if="!isInterfaceHidden"
      :is-spinner-shown
      :is-welcome-shown
      :player-name
      :progress="shownProgress"
      :stage
      :status-step
    />
    <div v-if="stage === LoginStage.Arriving" class="arrive" />
    <div :class="['flash', { lit: stage === LoginStage.Entering }]" @transitionend="emit('begin')" />
  </GameScreen>
</template>

<style scoped>
.login-screen {
  background: #000;
}

/* The white the screen fades up out of as it arrives */
.arrive {
  position: absolute;
  inset: 0;
  animation: arrive calc(v-bind(LOGIN_ARRIVE_FADE_MS) * 1ms) linear forwards;
  background: #fff;
  pointer-events: none;
}

@keyframes arrive {
  to {
    opacity: 0;
  }
}

.flash {
  position: absolute;
  inset: 0;
  background: #fff;
  opacity: 0;
  pointer-events: none;
}

.lit {
  opacity: 1;
  transition: opacity calc(v-bind(LOGIN_FLASH_MS) * 1ms) ease-out;
}
</style>

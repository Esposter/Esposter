<script setup lang="ts">
import type { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import type { TresRendererSetupContext } from "@tresjs/core";
import type { GameLanguage, GameText } from "genshin-text";

import LoginInterface from "#src/components/Login/Interface/Index.vue";
import LoginMusic from "#src/components/Login/Music/Index.vue";
import LoginScene from "#src/components/Login/Scene/Index.vue";
import { LoginStage } from "#src/models/login/LoginStage";
import { LoginStatusStep } from "#src/models/login/LoginStatusStep";
import {
  LOGIN_DOOR_AFTER_LOAD_MS,
  LOGIN_FLIGHT_LOADING_SHARE,
  LOGIN_PROGRESS_FILL_MS,
  LOGIN_SPINNER_START_MS,
  LOGIN_STATUS_STEPS,
  LOGIN_TITLE_START_MS,
  LOGIN_TRAVELER_GENDER,
} from "#src/services/login/constants";
import { checkIsNestedInteraction } from "@esposter/shared";
import { TresCanvas } from "@tresjs/core";
import { useRafFn, useTimeoutFn, watchImmediate } from "@vueuse/core";
import { createGenshinRenderer, GENSHIN_TONE_MAPPING } from "genshin-engine";
import { GameScreen } from "genshin-interface";
import { fillLinePlaceholders, GameTextKey } from "genshin-text";
import { PCFShadowMap } from "three";
import { unref } from "vue";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The glide held still at this many metres scrolled, for a reference taken at one moment of the title's loop
  heldScrolled?: number;
  // The scene alone, as the recordings idling with no interface show it, for a reference to be scored against, and
  // Silent
  isInterfaceHidden?: true;
  // The reader's language, whose client's interface the screen shows
  language: GameLanguage;
  playerName?: string;
  // How far loading has gone, from 0 to 1, which the bar shows and the flight to the door follows, ending a fixed time after
  // It is done
  progress: number;
  timeOfDay: LoginTimeOfDay;
}

const { gameText, heldScrolled, isInterfaceHidden, language, playerName, progress, timeOfDay } = defineProps<Props>();
// The name the screen welcomes the player by, the game's own word for the Traveler until they have chosen one
const shownPlayerName = computed(
  () => playerName || fillLinePlaceholders(gameText[GameTextKey.Traveler], "", LOGIN_TRAVELER_GENDER),
);
const emit = defineEmits<{ begin: []; ready: [] }>();
// The game's login screen: the scene fades up out of white, a click on its title quickens the glide down the
// Walkway as the game prepares, and a click on the door it arrives at lights it as the screen whitens, when `begin`
// Says the white is up. Both whites are the interface's, played from the game's own clips. A host pins a stage with `v-model:stage` to show it held, as the parity page does
const stage = defineModel<LoginStage>("stage", { default: LoginStage.Arriving });
const isSpinnerShown = ref(false);
// Whether the door has risen into place, which the door's own interface waits on
const isDoorFormed = ref(false);
const statusStep = ref(LoginStatusStep.PreparingDownload);
// The share of loading shown, which runs toward loading's own no faster than the bar's fill
const shownProgress = ref(0);
// The share of the way to the door flown, from the title at 0 to the door at 1: the screen's clock for when the door is
// Due, while the scene glides at its own pace and comes to rest at the door once it is
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
const statusTimeouts = LOGIN_STATUS_STEPS.map(({ ms, step }) =>
  useTimeoutFn(() => (statusStep.value = step), ms, { immediate: false }),
);
// The last stretch's pace, a share of the path a millisecond, which bounds the flight while loading too
const LAST_STRETCH_PACE = (1 - LOGIN_FLIGHT_LOADING_SHARE) / LOGIN_DOOR_AFTER_LOAD_MS;
// How long since loading was done, and how far the flight had gone then
let loadedMs = 0;
let loadedFlight = 0;
const { pause: pauseFlight, resume: flyOn } = useRafFn(
  ({ delta }) => {
    if (statusStep.value === LoginStatusStep.LoadingData)
      shownProgress.value = Math.min(shownProgress.value + delta / LOGIN_PROGRESS_FILL_MS, Math.min(progress, 1));
    if (shownProgress.value < 1) {
      const reach = shownProgress.value * LOGIN_FLIGHT_LOADING_SHARE;
      flight.value = Math.min(flight.value + delta * LAST_STRETCH_PACE, Math.max(flight.value, reach));
    } else {
      if (loadedMs === 0) loadedFlight = flight.value;
      loadedMs += delta;
      flight.value = loadedFlight + (1 - loadedFlight) * Math.min(loadedMs / LOGIN_DOOR_AFTER_LOAD_MS, 1);
    }
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
  } else if (newStage === LoginStage.Preparing) {
    for (const { start } of statusTimeouts) start();
    flyOn();
  }
});
const onClick = (event: MouseEvent): void => {
  if (checkIsNestedInteraction(event)) return;
  else if (stage.value === LoginStage.Title) stage.value = LoginStage.Preparing;
  // The door opens only once it has risen into place, as its prompt says it can
  else if (stage.value === LoginStage.Door && isDoorFormed.value) stage.value = LoginStage.Entering;
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
      <LoginScene
        :held-scrolled
        :is-door-lit="stage === LoginStage.Entering"
        :stage
        :time-of-day
        @door-formed="isDoorFormed = true"
        @ready="emit('ready')"
      />
    </TresCanvas>
    <LoginMusic v-if="!isInterfaceHidden" />
    <LoginInterface
      v-if="!isInterfaceHidden"
      :game-text
      :language
      :is-door-waiting="stage === LoginStage.Door && !isDoorFormed ? true : undefined"
      :is-spinner-shown
      :player-name="shownPlayerName"
      :progress="shownProgress"
      :stage
      :status-step
      @whiten="emit('begin')"
    />
  </GameScreen>
</template>

<style scoped>
.login-screen {
  background: #000;
}
</style>

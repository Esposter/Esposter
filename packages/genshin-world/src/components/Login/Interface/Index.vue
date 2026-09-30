<script setup lang="ts">
import type { LoginStatusStep } from "#src/models/login/LoginStatusStep";

import LoginStatus from "#src/components/Login/Status/Index.vue";
import { LoginStage } from "#src/models/login/LoginStage";
import {
  LOGIN_BEGIN_TEXT,
  LOGIN_SERVER_NAME,
  LOGIN_TITLE_TEXT,
  LOGIN_USER_LABEL,
  LOGIN_VERSION_TEXT,
  LOGIN_WELCOME_FADE_MS,
  LOGIN_WELCOME_TEXT,
} from "#src/services/login/constants";
import {
  GameScreen,
  InterfaceIcon,
  LoadingSpinner,
  OrnamentDivider,
  PromptBand,
  RoundButton,
  ServerBar,
  ToastNotice,
} from "genshin-ui";

interface Props {
  isSpinnerShown?: boolean;
  isWelcomeShown?: boolean;
  playerName: string;
  // How far loading has gone, from 0 to 1
  progress: number;
  stage: LoginStage;
  statusStep: LoginStatusStep;
}

const { isSpinnerShown, isWelcomeShown, playerName, progress, stage, statusStep } = defineProps<Props>();
// The login screen's interface over its scene, for the stage it is at: the title with the server and account under
// It, the status as the game prepares, then the prompt at the door. The power button and the build string stay
// Throughout; the corner buttons are the title's two and the door's four, as the game's current build shows them. A
// Click on a button is the button's alone: the screen behind it asks whether it was before it begins
const cornerIcons = computed(() => {
  if (stage === LoginStage.Title) return [InterfaceIcon.Notice, InterfaceIcon.Exit];
  else if (stage === LoginStage.Door)
    return [InterfaceIcon.Settings, InterfaceIcon.Repair, InterfaceIcon.Notice, InterfaceIcon.Exit];
  return [];
});
const isFooterShown = computed(() => stage !== LoginStage.Arriving && stage !== LoginStage.Entering);
</script>

<template>
  <GameScreen class="login-interface">
    <LoadingSpinner v-if="isSpinnerShown" class="spinner" />
    <ToastNotice :class="['welcome', { shown: isWelcomeShown }]">
      <template #mark>
        <span class="initial">{{ playerName.charAt(0).toUpperCase() }}</span>
      </template>
      {{ LOGIN_WELCOME_TEXT }} {{ playerName }}
    </ToastNotice>
    <template v-if="stage === LoginStage.Title">
      <!-- A heading to a screen reader, drawn as a paragraph so no host's own heading styles reach it -->
      <p class="title" role="heading" aria-level="1">{{ LOGIN_TITLE_TEXT }}</p>
      <OrnamentDivider class="divider" />
      <p class="subtitle">{{ LOGIN_BEGIN_TEXT }}</p>
      <ServerBar class="server" :name="LOGIN_SERVER_NAME" />
      <p class="user">
        <span class="user-label">{{ LOGIN_USER_LABEL }}</span> <span class="user-name">{{ playerName }}</span>
      </p>
    </template>
    <LoginStatus v-else-if="stage === LoginStage.Preparing" :progress :step="statusStep" />
    <PromptBand v-else-if="stage === LoginStage.Door" class="prompt">{{ LOGIN_BEGIN_TEXT }}</PromptBand>
    <template v-if="isFooterShown">
      <RoundButton class="power" :icon="InterfaceIcon.Power" label="Quit" />
      <p class="version">{{ LOGIN_VERSION_TEXT }}</p>
      <div class="corner">
        <RoundButton v-for="icon of cornerIcons" :key="icon" :icon :label="icon" />
      </div>
    </template>
  </GameScreen>
</template>

<style scoped>
/* Measured from the English client's login screen at 1080 high, each place from the screen's middle and the corners
   From its sides by the game's edge inset; the corner buttons and the welcome card from the 1440 high recording of the
   Current build. Only the buttons take a click, which they keep from the screen */
.login-interface {
  color: #fff;
  pointer-events: none;
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
}

.welcome {
  position: absolute;
  top: calc(var(--unit) * 133);
  left: 50%;
  opacity: 0;
  transition: opacity calc(v-bind(LOGIN_WELCOME_FADE_MS) * 1ms) linear;
  translate: -50% 0;
}

.shown {
  opacity: 1;
  transition: none;
}

.initial {
  color: #fff;
  font-size: calc(var(--unit) * 32);
  font-weight: 600;
  line-height: 1;
}

.title,
.subtitle,
.user,
.version {
  position: absolute;
  margin: 0;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.title,
.subtitle,
.user {
  left: 50%;
  translate: -50% -50%;
}

/* Signika is narrower than the game's face at one cap height, so the title keeps the game's cap height and is spaced
   Out to its width, as the subtitle is */
.title {
  top: calc(50% - var(--unit) * 33);
  font-size: calc(var(--unit) * 63);
  letter-spacing: 0.05em;
}

.divider {
  position: absolute;
  top: calc(50% + var(--unit) * 17);
  left: 50%;
  width: calc(var(--unit) * 418);
  opacity: 0.75;
  translate: -50% -50%;
}

.subtitle {
  top: calc(50% + var(--unit) * 51);
  color: rgb(255 255 255 / 0.55);
  font-size: calc(var(--unit) * 27.5);
  letter-spacing: 0.04em;
}

.server {
  position: absolute;
  top: calc(50% + var(--unit) * 349);
  left: 50%;
  translate: -50% 0;
}

.user {
  top: calc(50% + var(--unit) * 480);
  font-size: calc(var(--unit) * 24);
  letter-spacing: 0.05em;
}

.user-label {
  color: #00dbfd;
}

.user-name {
  color: #f9dc38;
}

.prompt {
  position: absolute;
  top: calc(50% + var(--unit) * 458);
  right: calc(var(--unit) * 100);
  left: calc(var(--unit) * 100);
}

.power {
  position: absolute;
  top: calc(50% + var(--unit) * 418);
  left: calc(var(--edge-inset) - var(--unit) * 26);
  pointer-events: auto;
}

.version {
  bottom: calc(50% - var(--unit) * 519.5);
  left: calc(var(--edge-inset) - var(--unit) * 24);
  font-size: calc(var(--unit) * 22);
  text-shadow:
    0 0 calc(var(--unit) * 1.5) #1a0e0e,
    0 0 calc(var(--unit) * 1.5) #1a0e0e;
}

/* The corner's buttons stacked up from the foot, 91.5 units apart, their centres the edge inset in from the side */
.corner {
  position: absolute;
  right: calc(var(--edge-inset) - var(--unit) * 26);
  bottom: calc(50% - var(--unit) * 470);
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 39.5);
}

.corner > * {
  pointer-events: auto;
}
</style>

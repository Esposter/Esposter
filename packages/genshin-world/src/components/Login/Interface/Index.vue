<script setup lang="ts">
import type { LoginStatusStep } from "#src/models/login/LoginStatusStep";
import type { GameLanguage, GameText } from "genshin-text";

import LoginStatus from "#src/components/Login/Status/Index.vue";
import ageRating from "#src/data/login/ageRating.json";
import { LoginInterfaceRect } from "#src/models/login/LoginInterfaceRect";
import { LoginStage } from "#src/models/login/LoginStage";
import { GameClient } from "#src/models/splash/GameClient";
import {
  LOGIN_DOOR_BUTTONS_DELAY_MS,
  LOGIN_DOOR_PROMPT_DELAY_MS,
  LOGIN_DOOR_PROMPT_FADE_MS,
  LOGIN_SERVER_NAME,
  LOGIN_WELCOME_FADE_MS,
} from "#src/services/login/constants";
import { GameClientVersionTextMap } from "#src/services/login/GameClientVersionTextMap";
import { LoginInterfaceRectMap } from "#src/services/login/interface/LoginInterfaceRectMap";
import { GameLanguageGameClientMap } from "#src/services/splash/GameLanguageGameClientMap";
import {
  GameScreen,
  InterfaceIcon,
  LoadingSpinner,
  OrnamentDivider,
  PromptBand,
  RoundButton,
  ServerBar,
  ToastNotice,
  toCanvasRectStyle,
} from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the door is still rising, which the door's prompt and corner buttons wait on, as the game's do
  isDoorWaiting?: true;
  isSpinnerShown?: boolean;
  isWelcomeShown?: boolean;
  // The reader's language, whose client's build string and age rating the screen shows
  language: GameLanguage;
  playerName: string;
  // How far loading has gone, from 0 to 1
  progress: number;
  stage: LoginStage;
  statusStep: LoginStatusStep;
}

const { gameText, isDoorWaiting, isSpinnerShown, isWelcomeShown, language, playerName, progress, stage, statusStep } =
  defineProps<Props>();
const client = computed(() => GameLanguageGameClientMap[language]);
// The account kit's greeting, which places the player's name where its language puts it
const welcome = computed(() => gameText[GameTextKey.LoginWelcome].replace("%s", playerName));
// The login screen's interface over its scene, for the stage it is at: the title with the server and account under
// It, the status as the game prepares, then the prompt at the door. The power button and the build string stay
// Throughout; the corner buttons are the title's two and the door's four, as the game's current build shows them. A
// Click on a button is the button's alone: the screen behind it asks whether it was before it begins
const cornerIcons = computed(() => {
  if (stage === LoginStage.Title) return [InterfaceIcon.Notice, InterfaceIcon.Exit];
  else if (stage === LoginStage.Door && !isDoorWaiting)
    return [InterfaceIcon.Settings, InterfaceIcon.Repair, InterfaceIcon.Notice, InterfaceIcon.Exit];
  return [];
});
const isFooterShown = computed(() => stage !== LoginStage.Arriving && stage !== LoginStage.Entering);
</script>

<template>
  <GameScreen class="login-interface">
    <LoadingSpinner v-if="isSpinnerShown" class="spinner" />
    <!-- Mainland China's age rating (CADPA, 12 and over), which its client keeps in the corner of every login stage -->
    <svg v-if="client === GameClient.Mainland" class="age-rating" viewBox="0 0 84 110" role="img" aria-label="12+">
      <rect width="84" height="110" rx="6" fill="#fff" />
      <rect x="7" y="8" width="70" height="78" rx="4" fill="#178ed0" />
      <path :d="ageRating.age" transform="translate(9 10) scale(0.125)" fill="#fff" />
      <text x="42" y="83" class="age-rating-name">CADPA</text>
      <path :d="ageRating.notice" transform="translate(2 87) scale(0.125)" fill="#111" />
    </svg>
    <ToastNotice :class="['welcome', { shown: isWelcomeShown }]">
      <template #mark>
        <span class="initial">{{ playerName.charAt(0).toUpperCase() }}</span>
      </template>
      {{ welcome }}
    </ToastNotice>
    <template v-if="stage === LoginStage.Title">
      <!-- A heading to a screen reader, drawn as a paragraph so no host's own heading styles reach it -->
      <p class="title" role="heading" aria-level="1">{{ gameText[GameTextKey.LoginTitle] }}</p>
      <OrnamentDivider class="divider" />
      <p class="subtitle">{{ gameText[GameTextKey.LoginBegin] }}</p>
      <div class="server" :style="toCanvasRectStyle(LoginInterfaceRectMap[LoginInterfaceRect.ServerBar], true)">
        <ServerBar :name="LOGIN_SERVER_NAME" />
      </div>
    </template>
    <!-- The foot, anchored to the screen's bottom as the game's is, so everything in it stays there on any window: the -->
    <!-- Loading row and the prompt, the account and the build string, and both button columns -->
    <div v-if="isFooterShown" :style="toCanvasRectStyle(LoginInterfaceRectMap[LoginInterfaceRect.Bottom], true)">
      <LoginStatus v-if="stage === LoginStage.Preparing" :game-text :progress :step="statusStep" />
      <PromptBand v-else-if="stage === LoginStage.Door && !isDoorWaiting" class="prompt">{{
        gameText[GameTextKey.LoginBegin]
      }}</PromptBand>
      <div class="column" :style="toCanvasRectStyle(LoginInterfaceRectMap[LoginInterfaceRect.LeftButtons])">
        <div class="slot"><RoundButton :icon="InterfaceIcon.Power" label="Quit" /></div>
      </div>
      <div class="column" :style="toCanvasRectStyle(LoginInterfaceRectMap[LoginInterfaceRect.RightButtons])">
        <div v-for="icon of cornerIcons" :key="icon" :class="['slot', { arriving: stage === LoginStage.Door }]">
          <RoundButton :icon :label="icon" />
        </div>
      </div>
      <div :style="toCanvasRectStyle(LoginInterfaceRectMap[LoginInterfaceRect.CurrentAccount])">
        <p v-if="stage === LoginStage.Title" class="user">
          <!-- The space after the label is its own, since the template drops one between two lines -->
          <span class="user-label">{{ `${gameText[GameTextKey.LoginUserLabel]} ` }}</span>
          <span class="user-name">{{ playerName }}</span>
        </p>
        <div :style="toCanvasRectStyle(LoginInterfaceRectMap[LoginInterfaceRect.Version])">
          <p class="version">
            {{ GameClientVersionTextMap[client] }}
          </p>
        </div>
      </div>
    </div>
  </GameScreen>
</template>

<style scoped>
/* Measured from the English client's login screen at 1080 high, each place from the screen's middle, but the foot and
   The server bar, which the game's RectTransforms place (LoginInterfaceRectMap); the corner buttons' spacing and the
   Welcome card from the 1440 high recording of the current build. Only the buttons take a click, which they keep from
   The screen */
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

/* Mainland China's age rating, measured off its launch recording (`bili-av532052219`, 1080 high): 84 by 110 units,
   65 in from the screen's right and 52 down, a blue panel inset 7 and 8 over a white band naming it */
.age-rating {
  position: absolute;
  top: calc(var(--unit) * 52);
  right: calc(var(--unit) * 65);
  width: calc(var(--unit) * 84);
}

/* Its age and notice are traced off the recording at eight times its size (`genshin:parity trace`); its CADPA is
   Set in a serif, whose thin strokes are too few of the recording's pixels to trace */
.age-rating-name {
  fill: #fff;
  font-family: serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-anchor: middle;
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
.subtitle {
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
  display: grid;
  place-items: center;
}

/* The account line's middle 60 units over the foot, in the account row */
.user {
  bottom: calc(var(--unit) * 60);
  left: 50%;
  font-size: calc(var(--unit) * 24);
  letter-spacing: 0.05em;
  translate: -50% 50%;
}

.user-label {
  color: #00dbfd;
}

.user-name {
  color: #f9dc38;
}

/* The prompt's band 38 units over the screen's foot on the 1080 high recording, across the foot less 100 units a side:
   its RectTransform is a prefab the page loads at run time (BtnPressStart), so its place is measured */
.prompt {
  position: absolute;
  right: calc(var(--unit) * 100);
  bottom: calc(var(--unit) * 38);
  left: calc(var(--unit) * 100);
}

/* Once the door has formed, its prompt fades in and its corner buttons appear, each after its delay in the recording */
.prompt {
  animation: door-arrive calc(v-bind(LOGIN_DOOR_PROMPT_FADE_MS) * 1ms) linear
    calc(v-bind(LOGIN_DOOR_PROMPT_DELAY_MS) * 1ms) backwards;
}

.arriving {
  animation: door-arrive 0s linear calc(v-bind(LOGIN_DOOR_BUTTONS_DELAY_MS) * 1ms) backwards;
}

@keyframes door-arrive {
  from {
    opacity: 0;
  }
}

/* A button column the game's layout group stacks from its foot, each button in a slot 52 canvas units square, their
   Middles 91.5 units apart on the 1440 high recording */
.column {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: calc(var(--unit) * 91.5 - var(--canvas-unit) * 52);
}

.slot {
  display: grid;
  height: calc(var(--canvas-unit) * 52);
  place-items: center;
  pointer-events: auto;
}

/* The build string's foot 20.5 units over the screen's, at its box's left */
.version {
  bottom: calc(var(--unit) * 20.5);
  left: 0;
  font-size: calc(var(--unit) * 22);
  text-shadow:
    0 0 calc(var(--unit) * 1.5) #1a0e0e,
    0 0 calc(var(--unit) * 1.5) #1a0e0e;
}
</style>

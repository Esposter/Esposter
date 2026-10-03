<script setup lang="ts">
import type { LoginStatusStep } from "#src/models/login/LoginStatusStep";
import type { GameLanguage, GameText } from "genshin-text";

import LoginStatus from "#src/components/Login/Status/Index.vue";
import ageRating from "#src/data/login/ageRating.json";
import { LoginInterfaceClip } from "#src/models/login/LoginInterfaceClip";
import { LoginInterfaceClipTarget } from "#src/models/login/LoginInterfaceClipTarget";
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
import { LoginInterfaceClipMap } from "#src/services/login/interface/LoginInterfaceClipMap";
import { LoginInterfaceRectMap } from "#src/services/login/interface/LoginInterfaceRectMap";
import { GameLanguageGameClientMap } from "#src/services/splash/GameLanguageGameClientMap";
import {
  GameScreen,
  InterfaceIcon,
  LoadingSpinner,
  OrnamentDivider,
  playInterfaceClip,
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
// The white is up as the screen enters, the moment the screen hands on
const emit = defineEmits<{ whiten: [] }>();
const client = computed(() => GameLanguageGameClientMap[language]);
// The account kit's greeting, which places the player's name where its language puts it
const welcome = computed(() => gameText[GameTextKey.LoginWelcome].replace("%s", () => playerName));
// The door's interface stays through the entering, fading with the foot as the page whitens
const isAtDoor = computed(() => stage === LoginStage.Door || stage === LoginStage.Entering);
// The login screen's interface over its scene, for the stage it is at: the title with the server and account under
// It, the status as the game prepares, then the prompt at the door. The power button and the build string stay
// Throughout; the corner buttons are the title's two and the door's four, as the game's current build shows them. A
// Click on a button is the button's alone: the screen behind it asks whether it was before it begins
const cornerIcons = computed(() => {
  if (stage === LoginStage.Title) return [InterfaceIcon.Notice, InterfaceIcon.Exit];
  else if (isAtDoor.value && !isDoorWaiting)
    return [InterfaceIcon.Settings, InterfaceIcon.Repair, InterfaceIcon.Notice, InterfaceIcon.Exit];
  return [];
});
const isFooterShown = computed(() => stage !== LoginStage.Arriving);
// The page the game's clips play on, each piece they move named by its path under the game's page
const page = useTemplateRef("page");
// Whether the title is still fading out after its click, which keeps it drawn until the fade has run
const isStartLeaving = ref(false);
const isStartShown = computed(() => stage === LoginStage.Title || isStartLeaving.value);
const playClip = (clip: LoginInterfaceClip): Animation[] =>
  page.value ? playInterfaceClip(page.value, LoginInterfaceClipMap[clip]) : [];
// Each stage's clips as the game plays them: the white curtain then the page fading in on arriving, the title fading in
// At the title and out on its click, and the page fading into white on entering. A clip's tracks share its length, so
// Any one of them ending is the clip's end
const playStageClips = (newStage: LoginStage, oldStage?: LoginStage): void => {
  if (oldStage === LoginStage.Title) {
    const [startFadeOut] = playClip(LoginInterfaceClip.StartFadeOut);
    if (startFadeOut) startFadeOut.addEventListener("finish", () => (isStartLeaving.value = false), { once: true });
    else isStartLeaving.value = false;
  }

  if (newStage === LoginStage.Arriving) {
    playClip(LoginInterfaceClip.WhiteCurtain);
    playClip(LoginInterfaceClip.FadeIn);
  } else if (newStage === LoginStage.Title) playClip(LoginInterfaceClip.StartFadeIn);
  else if (newStage === LoginStage.Entering) {
    const [fadeOut] = playClip(LoginInterfaceClip.FadeOut);
    if (fadeOut) fadeOut.addEventListener("finish", () => emit("whiten"), { once: true });
    else emit("whiten");
  }
};
onMounted(() => playStageClips(stage));
watch(
  () => stage,
  async (newStage, oldStage) => {
    // The title is kept before the new stage's render would drop it, and the clips play once that render is drawn
    if (oldStage === LoginStage.Title) isStartLeaving.value = true;
    await nextTick();
    playStageClips(newStage, oldStage);
  },
);
</script>

<template>
  <GameScreen class="login-interface">
    <div ref="page" class="page">
      <!-- The white the page fades up out of as it arrives and into as it enters, which only the clips draw -->
      <div class="white-screen" :data-clip-target="LoginInterfaceClipTarget.WhiteScreen" />
      <LoadingSpinner v-if="isSpinnerShown" class="spinner" />
      <div class="center" :data-clip-target="LoginInterfaceClipTarget.Center">
        <!-- Mainland China's age rating (CADPA, 12 and over), which its client keeps in the corner of every login -->
        <!-- Stage -->
        <svg
          v-if="client === GameClient.Mainland"
          class="age-rating"
          viewBox="0 0 84 110"
          role="img"
          aria-label="12+"
          :data-clip-target="LoginInterfaceClipTarget.RatingBadge"
        >
          <rect class="age-rating-white" width="84" height="110" rx="6" />
          <rect x="7" y="8" width="70" height="78" rx="4" fill="#178ed0" />
          <path class="age-rating-white" :d="ageRating.age" transform="translate(9 10) scale(0.125)" />
          <text x="42" y="83" class="age-rating-white age-rating-name">CADPA</text>
          <path :d="ageRating.notice" transform="translate(2 87) scale(0.125)" fill="#111" />
        </svg>
        <!-- The title is the game's start button, and stays through its fade out after the click -->
        <div v-if="isStartShown" class="start" :data-clip-target="LoginInterfaceClipTarget.Start">
          <!-- A heading to a screen reader, drawn as a paragraph so no host's own heading styles reach it -->
          <p class="title" role="heading" aria-level="1">{{ gameText[GameTextKey.LoginTitle] }}</p>
          <OrnamentDivider class="divider" />
          <p class="subtitle">{{ gameText[GameTextKey.LoginBegin] }}</p>
        </div>
        <div
          v-if="stage === LoginStage.Title"
          class="server"
          :style="toCanvasRectStyle(LoginInterfaceRectMap[LoginInterfaceRect.ServerBar], true)"
          :data-clip-target="LoginInterfaceClipTarget.Server"
        >
          <ServerBar :name="LOGIN_SERVER_NAME" />
        </div>
      </div>
      <ToastNotice :class="['welcome', { shown: isWelcomeShown }]">
        <template #mark>
          <span class="initial">{{ playerName.charAt(0).toUpperCase() }}</span>
        </template>
        {{ welcome }}
      </ToastNotice>
      <!-- The foot, anchored to the screen's bottom as the game's is, so everything in it stays there on any window: -->
      <!-- The loading row and the prompt, the account and the build string, and both button columns -->
      <div
        v-if="isFooterShown"
        :style="toCanvasRectStyle(LoginInterfaceRectMap[LoginInterfaceRect.Bottom], true)"
        :data-clip-target="LoginInterfaceClipTarget.Bottom"
      >
        <LoginStatus v-if="stage === LoginStage.Preparing" :game-text :progress :step="statusStep" />
        <PromptBand v-else-if="isAtDoor && !isDoorWaiting" class="prompt">{{
          gameText[GameTextKey.LoginBegin]
        }}</PromptBand>
        <div class="column" :style="toCanvasRectStyle(LoginInterfaceRectMap[LoginInterfaceRect.LeftButtons])">
          <div class="slot"><RoundButton :icon="InterfaceIcon.Power" label="Quit" /></div>
        </div>
        <div class="column" :style="toCanvasRectStyle(LoginInterfaceRectMap[LoginInterfaceRect.RightButtons])">
          <div v-for="icon of cornerIcons" :key="icon" :class="['slot', { arriving: isAtDoor }]">
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

/* The page the clips play on and scale about its middle, and the groups they fade, each over the whole screen so
   Every piece in them is placed as it is without them */
.page,
.center,
.start {
  position: absolute;
  inset: 0;
}

/* Clear until a clip draws it; it overhangs the page by a twentieth, so the page's own scale, down to 0.96 as it fades
   In, never uncovers the screen's edge */
.white-screen {
  position: absolute;
  inset: -5%;
  background: var(--white);
  opacity: 0;
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

/* Its white is the recording's, a pale blue rather than full white, wherever it stands on the badge */
.age-rating-white {
  fill: #dfeaf5;
}

/* Its age and notice are traced off the recording at eight times its size (`genshin:parity trace`); its CADPA is
   Set in a serif, whose thin strokes are too few of the recording's pixels to trace */
.age-rating-name {
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

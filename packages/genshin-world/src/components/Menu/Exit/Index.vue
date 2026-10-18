<script setup lang="ts">
import type { InteractionState } from "genshin-interface";
import type { GameText } from "genshin-text";

import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // A state every choice is drawn in, forced by a fixture; a reader's pointer sets it itself
  interactionState?: InteractionState;
}

const { gameText, interactionState } = defineProps<Props>();
const emit = defineEmits<{ close: []; quit: [] }>();
const cancelButton = useTemplateRef("cancelButton");
// The prompt is a dialog over the menu, so focus starts on Cancel, the way back to the menu
onMounted(() => {
  cancelButton.value?.focus();
});
</script>

<template>
  <!-- The quit prompt that Quit Game opens over the menu, which stays behind it dimmed. Cancel sets the menu back, and
       Confirm leaves for the login interface, the app's home, since the browser cannot close the game. The 2026 build
       draws two choices, each a slate pill with its icon at the left and its label centred in the rest -->
  <GameScreen
    class="exit"
    role="dialog"
    aria-modal="true"
    :aria-label="gameText[GameTextKey.QuitConfirmQuestion]"
    :interaction-state
  >
    <div class="backdrop" />
    <div class="dialog">
      <p class="question">{{ gameText[GameTextKey.QuitConfirmQuestion] }}</p>
      <GameButton ref="cancelButton" class="choice cancel" :kind="GameButtonKind.Row" @click="emit('close')">
        <span class="icon icon-cancel" />
        <span class="label">{{ gameText[GameTextKey.Cancel] }}</span>
      </GameButton>
      <GameButton class="choice confirm" :kind="GameButtonKind.Row" @click="emit('quit')">
        <span class="icon icon-confirm" />
        <span class="label">{{ gameText[GameTextKey.Confirm] }}</span>
      </GameButton>
    </div>
  </GameScreen>
</template>

<style scoped>
/* The prompt's scale is the game's own 1080 high unit, since the 2026 recording of the whole prompt fixes its pixels: the
   dialog is 960 by 606 reference pixels, centred, and each choice sits 70 pixels in from its side of the dialog */
.exit {
  --reference-pixel: calc(var(--unit) * 1);
}

.backdrop {
  position: absolute;
  inset: 0;
  /* The World Level dialog's backdrop, the one the game dims a dialog over the world with */
  background: rgb(0 0 0 / 48%);
}

.dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--reference-pixel) * 960);
  height: calc(var(--reference-pixel) * 606);
  transform: translate(-50%, -50%);
  /* The panel's median colour in the 2026 frame at 30 seconds (`yt-jHr2bERjkYc`), sampled from a clean band of it */
  background: #e2dfd8;
}

/* The question centred across the top of the panel, its line at 514 of 1080 in the frame at 30 seconds */
.question {
  position: absolute;
  top: calc(var(--reference-pixel) * 258);
  left: 0;
  width: 100%;
  margin: 0;
  font-size: calc(var(--reference-pixel) * 36);
  line-height: calc(var(--reference-pixel) * 40);
  text-align: center;
  /* The darkest ink of the question in the 2026 frame at 30 seconds (`yt-jHr2bERjkYc`), sampled */
  color: #3a434b;
}

/* A choice is a slate pill: the Row kind with its cream pill look replaced, since the 2026 choices are slate, not cream */
.exit .choice {
  position: absolute;
  top: calc(var(--reference-pixel) * 498);
  width: calc(var(--reference-pixel) * 390);
  height: calc(var(--reference-pixel) * 67);
  padding: 0 0 0 calc(var(--reference-pixel) * 32);
  border-radius: calc(infinity * 1px);
  /* The pills' median colour in the 2026 frame at 30 seconds (`yt-jHr2bERjkYc`), sampled from a clean band of each */
  background: #404a5e;
  color: #ffffff;
  text-align: center;
}

.exit .cancel {
  left: calc(var(--reference-pixel) * 70);
}

.exit .confirm {
  left: calc(var(--reference-pixel) * 500);
}

.label {
  position: relative;
  display: block;
  font-size: calc(var(--reference-pixel) * 36);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 67);
}

/* Each icon sits in a 38 unit box at 14 units in, so its centre is 33 units in from the pill's corner, as in the frame */
.icon {
  position: absolute;
  top: calc(var(--reference-pixel) * 14);
  left: calc(var(--reference-pixel) * 14);
  width: calc(var(--reference-pixel) * 38);
  height: calc(var(--reference-pixel) * 38);
  box-sizing: border-box;
}

/* Cancel's blue cross, two bars across the disc, drawn as shapes since the icon's paths are not traced */
.icon-cancel::before,
.icon-cancel::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--reference-pixel) * 30);
  height: calc(var(--reference-pixel) * 6);
  margin: calc(var(--reference-pixel) * -3) 0 0 calc(var(--reference-pixel) * -15);
  border-radius: calc(var(--reference-pixel) * 3);
  /* The cross's most saturated blue in the 2026 frame at 30 seconds (`yt-jHr2bERjkYc`), sampled */
  background: #2998dc;
}

.icon-cancel::before {
  transform: rotate(45deg);
}

.icon-cancel::after {
  transform: rotate(-45deg);
}

/* Confirm's yellow hollow ring, drawn as a shape like Cancel's cross */
.icon-confirm {
  /* The ring's most saturated yellow in the 2026 frame at 30 seconds (`yt-jHr2bERjkYc`), sampled */
  border: calc(var(--reference-pixel) * 6) solid #f7ca33;
  border-radius: 50%;
}
</style>

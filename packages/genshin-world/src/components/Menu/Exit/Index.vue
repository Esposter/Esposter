<script setup lang="ts">
import type { InteractionState } from "genshin-interface";
import type { GameText } from "genshin-text";

import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // A state a fixture forces on Confirm, the choice the game's pointer rests on in its shots; a reader's pointer lights a
  // Choice itself
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
       confirm leaves for the login interface, the app's home, since the browser cannot close the game. The 2026 build
       draws a cream panel with gold brackets at its corners and two slate pills, each with a disc at its left: Cancel's
       blue cross and Confirm's gold ring -->
  <GameScreen
    class="exit"
    role="dialog"
    aria-modal="true"
    :aria-label="gameText[GameTextKey.QuitConfirmQuestion]"
    :interaction-state
  >
    <div class="backdrop" />
    <div class="dialog">
      <span class="bracket bracket-top-left" />
      <span class="bracket bracket-top-right" />
      <span class="bracket bracket-bottom-left" />
      <span class="bracket bracket-bottom-right" />
      <span class="frame" />
      <span class="rule rule-top" />
      <span class="rule rule-bottom" />
      <p class="question">{{ gameText[GameTextKey.QuitConfirmQuestion] }}</p>
      <GameButton ref="cancelButton" class="choice cancel" :kind="GameButtonKind.Choice" @click="emit('close')">
        <span class="icon icon-cancel" />
        <span class="label">{{ gameText[GameTextKey.Cancel] }}</span>
      </GameButton>
      <GameButton
        class="choice confirm"
        :data-interaction-state="interactionState"
        :kind="GameButtonKind.Choice"
        @click="emit('quit')"
      >
        <span class="icon icon-confirm" />
        <span class="label">{{ gameText[GameTextKey.Confirm] }}</span>
      </GameButton>
    </div>
  </GameScreen>
</template>

<style scoped>
/* The prompt's scale is the game's own 1080 high unit, since the 2026 recording of the whole prompt fixes its pixels */
.exit {
  --reference-pixel: calc(var(--unit) * 1);
}

/* The menu behind the prompt is drawn by the game and not by the page, so the dim is solved from the frame's own margin
   round the panel (its mean over the 2026 frame at 29 seconds, `yt-kIDee7nyD0w`), which the page's white draws at 66% */
.exit .backdrop {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 66%);
}

/* The panel is 910 by 576 reference pixels, centred over the menu, and its cream is the panel's colour in the 2026
   frame at 29 seconds (`yt-kIDee7nyD0w`), sampled from a clean band of it */
.exit .dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--reference-pixel) * 910);
  height: calc(var(--reference-pixel) * 576);
  transform: translate(-50%, -50%);
  background: #e4e0da;
}

/* The gold brackets stand 7 pixels out past each side of the panel and 6 past its top and bottom, each arm 4 pixels
   thick and 33 long, so the corner the two arms make sits outside the cream */
.bracket {
  position: absolute;
  width: calc(var(--reference-pixel) * 33);
  height: calc(var(--reference-pixel) * 32);
  border: 0 solid #f1d59b;
}

.bracket-top-left,
.bracket-top-right {
  top: calc(var(--reference-pixel) * -6);
}

.bracket-bottom-left,
.bracket-bottom-right {
  bottom: calc(var(--reference-pixel) * -6);
}

.bracket-top-left,
.bracket-bottom-left {
  left: calc(var(--reference-pixel) * -7);
}

.bracket-top-right,
.bracket-bottom-right {
  right: calc(var(--reference-pixel) * -7);
}

.bracket-top-left {
  border-width: calc(var(--reference-pixel) * 4) 0 0 calc(var(--reference-pixel) * 4);
}

.bracket-top-right {
  border-width: calc(var(--reference-pixel) * 4) calc(var(--reference-pixel) * 4) 0 0;
}

.bracket-bottom-left {
  border-width: 0 0 calc(var(--reference-pixel) * 4) calc(var(--reference-pixel) * 4);
}

.bracket-bottom-right {
  border-width: 0 calc(var(--reference-pixel) * 4) calc(var(--reference-pixel) * 4) 0;
}

/* A 2 pixel line in from the panel's edge on every side, 9 across and 10 down, in the rule colour of the 2026 frame at
   29 seconds */
.frame {
  position: absolute;
  top: calc(var(--reference-pixel) * 10);
  left: calc(var(--reference-pixel) * 9);
  box-sizing: border-box;
  width: calc(var(--reference-pixel) * 892);
  height: calc(var(--reference-pixel) * 556);
  border: calc(var(--reference-pixel) * 2) solid #dad3c6;
}

/* The two thin rules above and below the question, 820 pixels wide and 2 thick, in the panel's rule colour */
.rule {
  position: absolute;
  left: calc(var(--reference-pixel) * 45);
  width: calc(var(--reference-pixel) * 820);
  height: calc(var(--reference-pixel) * 2);
  background: #d6d2cc;
}

.rule-top {
  top: calc(var(--reference-pixel) * 84);
}

.rule-bottom {
  top: calc(var(--reference-pixel) * 449);
}

/* The question centred across the top of the panel, its line at 516 of 1080 in the 2026 frame at 29 seconds */
.question {
  position: absolute;
  top: calc(var(--reference-pixel) * 244);
  left: 0;
  width: 100%;
  margin: 0;
  font-size: calc(var(--reference-pixel) * 36);
  line-height: calc(var(--reference-pixel) * 40);
  /* The game's face sets the line 488 pixels wide at this cap height, where the open face sets 463, so it is spaced out */
  letter-spacing: calc(var(--reference-pixel) * 0.85);
  text-align: center;
  /* The question's common dark core in the 2026 frame at 29 seconds (`yt-kIDee7nyD0w`), sampled over its letters */
  color: #4f5159;
}

/* A choice is placed 370 by 63 pixels, its top 474 down the panel: Cancel 66 pixels in from the panel's left, Confirm 475
   in, each a mirror of the other across the panel's centre. Its look is the Choice kind's */
.exit .choice {
  position: absolute;
  top: calc(var(--reference-pixel) * 474);
  width: calc(var(--reference-pixel) * 370);
  height: calc(var(--reference-pixel) * 63);
}

.exit .cancel {
  left: calc(var(--reference-pixel) * 66);
}

.exit .confirm {
  left: calc(var(--reference-pixel) * 475);
}

.label {
  position: relative;
  display: block;
  font-size: calc(var(--reference-pixel) * 36);
  font-weight: 500;
  line-height: calc(var(--reference-pixel) * 63);
}

/* The mark sits in the choice's disc, which the Choice kind draws: 40 pixels across, 10 in from the pill's left and centred on
   its height */
.icon {
  position: absolute;
  top: 50%;
  left: calc(var(--reference-pixel) * 10);
  width: calc(var(--reference-pixel) * 40);
  height: calc(var(--reference-pixel) * 40);
  translate: 0 -50%;
}

/* Cancel's blue cross, two bars 22 by 5 across the disc, drawn as shapes since the icon's paths are not traced */
.icon-cancel::before,
.icon-cancel::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--reference-pixel) * 22);
  height: calc(var(--reference-pixel) * 5);
  margin: calc(var(--reference-pixel) * -2.5) 0 0 calc(var(--reference-pixel) * -11);
  border-radius: calc(var(--reference-pixel) * 3);
  /* The cross's blue in the 2026 frame at 29 seconds (`yt-kIDee7nyD0w`), sampled across its arms */
  background: #50a5e0;
}

.icon-cancel::before {
  transform: rotate(45deg);
}

.icon-cancel::after {
  transform: rotate(-45deg);
}

/* Confirm's gold ring, 20 pixels across inside its disc, 2.5 thick, pale when the choice is pressed */
.icon-confirm::after {
  content: "";
  position: absolute;
  inset: calc(var(--reference-pixel) * 10);
  border: calc(var(--reference-pixel) * 2.5) solid #f6cc52;
  border-radius: 50%;
}

.exit .confirm:enabled:is(:active, [data-interaction-state="Pressed"]) .icon-confirm::after {
  border-color: #fbf08f;
}
</style>

<script setup lang="ts">
import type { GameButtonKind } from "#src/models/GameButtonKind";

import {
  GAME_CREAM,
  GAME_GOLD,
  GAME_INK,
  GAME_LIT_GOLD,
  GAME_LIT_GOLD_LABEL,
  GAME_REPLY_HOVER,
  GAME_REPLY_HOVER_INK,
  GAME_REPLY_REST,
  GAME_ROW_HOVER,
  GAME_ROW_PRESS,
  GAME_SMOOTHSTEP_EASING,
  INTERACTION_HOVER_MS,
  INTERACTION_PILL_REST_MS,
  INTERACTION_PRESS_MS,
  INTERACTION_REST_MS,
} from "#src/services/constants";
import { useTemplateRef } from "vue";

interface Props {
  // The game's button template it is drawn as, which decides its look in each state
  kind: GameButtonKind;
  // The name a lit Disc shows beside it, as the side bar's buttons each show theirs, which also names it for a reader
  tip: string;
}

const { kind, tip } = defineProps<Props>();
const button = useTemplateRef("button");
const hoverDuration = `${INTERACTION_HOVER_MS}ms`;
const restDuration = `${INTERACTION_REST_MS}ms`;
const pillRestDuration = `${INTERACTION_PILL_REST_MS}ms`;
const pressDuration = `${INTERACTION_PRESS_MS}ms`;
// A dialog moves the keyboard's focus to its button
defineExpose({ focus: () => button.value?.focus() });
</script>

<template>
  <!-- One of the game's buttons, placed by its parent, in its kind's look for each state: at rest, hovered (or focused
       From the keyboard, which the game draws as a hover), pressed and disabled. The look is the button's own, and its content
       Takes the colour it sets -->
  <button ref="button" class="game-button" :data-kind="kind" type="button">
    <slot />
    <span v-if="tip" class="tip">{{ tip }}</span>
  </button>
</template>

<style scoped>
/* The parent places the button and may pad it, so these yield to any rule of its own */
:where(.game-button) {
  position: relative;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  cursor: inherit;
  font: inherit;
}

/* Each state is reached over its own crossfade: the duration is the state's being entered, so a hover fades in over
   The hover's and out over the rest's, and a press shows at once */
.game-button {
  --state-duration: v-bind(restDuration);
  transition: color var(--state-duration);
}

.game-button:enabled:is(:hover, :focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(hoverDuration);
}

.game-button:enabled:is(:active, [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
}

/* The side bar's icon, gold at rest. Hovered, a translucent navy disc 65 units across lights behind it, centred on its
   Ink, and the icon turns cream and grows by 1.12, its ink's area fitted at rest and hovered: the current English PC
   Client's settings gear at 1080 high (`yt-5EmJX_RyuY8-menu-settings` at 9.8 and 10.5 seconds). Pressed, the disc
   Turns cream and the icon ink, falling back to its resting size, the press's smaller click: the same gear held at 10.65
   Seconds, its ink's area 1.01 of its rest's. The disc's colour is fitted over two side bars' greens, the same
   Recording's and a 2024 one's (`yt-kIDee7nyD0w-menu-quit-prompt`) */
.game-button[data-kind="Disc"] {
  isolation: isolate;
}

/* At zero specificity, so a parent sets the icon's colour at rest where it places the button, as the rest of the
   Button yields */
:where(.game-button[data-kind="Disc"]) {
  color: v-bind(GAME_GOLD);
}

/* Behind everything the button holds, which its own layer keeps above it however it is placed */
.game-button[data-kind="Disc"]::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: 50%;
  left: 50%;
  width: calc(var(--unit) * 65);
  aspect-ratio: 1;
  border-radius: 50%;
  translate: -50% -50%;
  transition: background-color var(--state-duration);
}

.game-button[data-kind="Disc"] > :slotted(*) {
  transition: scale var(--state-duration);
}

.game-button[data-kind="Disc"]:enabled:is(:hover, :focus-visible, [data-interaction-state="Hover"] *) {
  outline: none;
  color: v-bind(GAME_CREAM);
}

.game-button[data-kind="Disc"]:enabled:is(:hover, :focus-visible, [data-interaction-state="Hover"] *)::before {
  background-color: rgb(30 49 63 / 0.5);
}

.game-button[data-kind="Disc"]:enabled:is(:hover, :focus-visible, [data-interaction-state="Hover"] *) > :slotted(*) {
  scale: 1.12;
}

.game-button[data-kind="Disc"]:enabled:is(:active, [data-interaction-state="Pressed"] *) {
  color: v-bind(GAME_INK);
}

.game-button[data-kind="Disc"]:enabled:is(:active, [data-interaction-state="Pressed"] *)::before {
  background-color: v-bind(GAME_CREAM);
}

.game-button[data-kind="Disc"]:enabled:is(:active, [data-interaction-state="Pressed"] *) > :slotted(*) {
  scale: 1;
}

/* An unbuilt screen's button, which the game never has, is drawn faded and answers nothing */
.game-button[data-kind="Disc"]:disabled {
  opacity: 0.4;
}

/* The lit icon's name, in a dark slate box 31 units high, centred on the icon and starting 49.5 units right of its
   Centre, 5 past the side bar's edge, its words 17 units to their caps: the same recording's "Settings", read once it
   Has settled at 10.5 seconds, where the box reads the same over the panel's cream and over a tile */
.tip {
  position: absolute;
  top: 50%;
  left: calc(50% + var(--unit) * 49.5);
  padding: 0 calc(var(--unit) * 9);
  border-radius: calc(var(--unit) * 3);
  background: #4d5063;
  color: #e6eaf0;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  line-height: calc(var(--unit) * 31);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--state-duration);
  translate: 0 -50%;
}

.game-button:enabled:is(:hover, :focus-visible, :active, [data-interaction-state] *) > .tip {
  opacity: 1;
}

/* A row, the game's rectangle, lit by a tint laid over its own box and behind its words, as a disc is: hovered or focused,
   pressed at once, or held selected by its parent's aria-selected at the hover's strength. Provisional, see the colours */
.game-button[data-kind="Row"] {
  isolation: isolate;
}

.game-button[data-kind="Row"]::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 0;
  border-radius: inherit;
  background-color: v-bind(GAME_ROW_HOVER);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--state-duration);
}

.game-button[data-kind="Row"]:enabled:is(:hover, :focus-visible, [data-interaction-state="Hover"] *)::before,
.game-button[data-kind="Row"][aria-selected="true"]::before {
  opacity: 1;
}

.game-button[data-kind="Row"]:enabled:is(:active, [data-interaction-state="Pressed"] *)::before {
  background-color: v-bind(GAME_ROW_PRESS);
  opacity: 1;
}

/* The cream pill, read off the game's own (block 07356235: the quit prompt's choices are its option pill, and a dialog's
   Confirm its brighter twin), its look measured on a dialog's Confirm at 1080 high (`yt-5EmJX_RyuY8-menu-settings` from
   140.5 seconds). At rest its words are the game's ink, inside a 3 unit pale rim and a 3 unit darker band within it,
   The pill's own bevel read off the wiki's crop of the quit prompt, and a faint dark shadow 7 units round it. Hovered,
   A white ring lights over its edge, 1 unit outside it and 2 within, its shadow turning a faint white glow; it holds
   Its size, the ring alone reaching past it */
.game-button[data-kind="Pill"] {
  --state-duration: v-bind(pillRestDuration);
  border-radius: calc(infinity * 1px);
  background-color: v-bind(GAME_CREAM);
  box-shadow:
    0 0 0 0 rgb(255 255 255 / 0),
    inset 0 0 0 calc(var(--unit) * 2) rgb(255 255 255 / 0),
    inset 0 0 0 calc(var(--unit) * 3) #f1ede5,
    inset 0 0 0 calc(var(--unit) * 6) #e6e1d5,
    0 0 calc(var(--unit) * 7) rgb(17 17 17 / 0.1);
  color: v-bind(GAME_INK);
  transition-duration: var(--state-duration);
  transition-property: background-color, box-shadow, color;
}

.game-button[data-kind="Pill"]:enabled:is(:hover, :focus-visible, [data-interaction-state="Hover"] *) {
  outline: none;
  box-shadow:
    0 0 0 calc(var(--unit) * 1) #fff,
    inset 0 0 0 calc(var(--unit) * 2) #fff,
    inset 0 0 0 calc(var(--unit) * 3) #f1ede5,
    inset 0 0 0 calc(var(--unit) * 6) #e6e1d5,
    0 0 calc(var(--unit) * 7) rgb(255 255 255 / 0.125);
}

/* Pressed, the pill's cream is tinted to slate at half alpha, its bevel lost in it, and from 2 units inside its edge a
   Gold light adds over it, as the game adds it, fading from full to half as the words turn from black to cream over the
   Press's clip. The game's light adds onto the world, which a screen's own layer cannot reach, so the gold is drawn
   Over the world at half alpha in the colour the sum settles to, the slate and its light together, which matches the
   Game's over any world but for red, 12 short where the sum passes white; the clip's first frame is the sum alone,
   Opaque. The words show over the light only when the pill's content is positioned, as a laid out label is not */
.game-button[data-kind="Pill"]::before {
  content: "";
  position: absolute;
  inset: 0;
  border: calc(var(--unit) * 2) solid rgb(73 83 103 / 0.5);
  border-radius: inherit;
  background: rgb(255 243 183 / 0.5) padding-box;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--state-duration);
}

.game-button[data-kind="Pill"]:enabled:is(:active, [data-interaction-state="Pressed"] *) {
  background-color: transparent;
  box-shadow:
    0 0 0 0 rgb(255 255 255 / 0),
    inset 0 0 0 calc(var(--unit) * 2) rgb(255 255 255 / 0),
    inset 0 0 0 calc(var(--unit) * 3) rgb(241 237 229 / 0),
    inset 0 0 0 calc(var(--unit) * 6) rgb(230 225 213 / 0),
    0 0 calc(var(--unit) * 7) rgb(255 255 255 / 0.1);
  color: v-bind(GAME_CREAM);
  animation: pill-press-words v-bind(pressDuration) v-bind(GAME_SMOOTHSTEP_EASING);
}

.game-button[data-kind="Pill"]:enabled:is(:active, [data-interaction-state="Pressed"] *)::before {
  opacity: 1;
  animation: pill-press-light v-bind(pressDuration) v-bind(GAME_SMOOTHSTEP_EASING);
}

@keyframes pill-press-words {
  from {
    color: #000;
  }
}

@keyframes pill-press-light {
  from {
    background-color: rgb(241 211 142);
  }
}

/* The quit prompt's choice: a slate pill whose dark disc sits at its left and holds the choice's mark, its label set past the
   disc. Lit by the pointer or focus, or by its screen's state on the choice itself, with a gold rim 2 units in and a faint gold
   glow out; pressed, a pale fill with a grey rim, its disc gold and its label gold. Its place and its words are its screen's */
.game-button[data-kind="Choice"] {
  padding: 0 0 0 calc(var(--unit) * 30);
  border-radius: calc(infinity * 1px);
  background-color: #4a5365;
  color: #fff;
  transition: none;
}

.game-button[data-kind="Choice"]::before {
  content: "";
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * 10);
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 40);
  border-radius: 50%;
  background-color: #2f3133;
  translate: 0 -50%;
}

.game-button[data-kind="Choice"]:enabled:is(:hover, :focus-visible, [data-interaction-state="Hover"]) {
  outline: none;
  box-shadow:
    inset 0 0 0 calc(var(--unit) * 2) #e6cf86,
    0 0 calc(var(--unit) * 3) rgb(255 236 170 / 80%);
}

.game-button[data-kind="Choice"]:enabled:is(:active, [data-interaction-state="Pressed"]) {
  background-color: #fffefa;
  box-shadow:
    inset 0 0 0 calc(var(--unit) * 2) #cbc5b9,
    0 0 calc(var(--unit) * 3) rgb(255 250 225 / 70%);
  color: #c4ab6a;
}

.game-button[data-kind="Choice"]:enabled:is(:active, [data-interaction-state="Pressed"])::before {
  background-color: #fed78c;
}

/* The weapon screen's Ascend, a lit gold pill with its label faded over the gold, read off its reference at 1080 high
   (`weapon-screen-ascend`), which draws no ring or bevel of its own */
.game-button[data-kind="Gold"] {
  border-radius: calc(infinity * 1px);
  background-color: v-bind(GAME_LIT_GOLD);
  color: v-bind(GAME_LIT_GOLD_LABEL);
}

/* The dialogue reply's pill: a fifth black over the scene at rest, its words white, and lit as a cream-white pill with slate
   Words when hovered, focused or selected by its screen. Its press holds that lit look at once. Provisional past the rest, see
   The constants */
.game-button[data-kind="Reply"] {
  --state-duration: v-bind(restDuration);
  border-radius: calc(var(--unit) * 23);
  background-color: v-bind(GAME_REPLY_REST);
  color: #fff;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 0.5);
  transition-duration: var(--state-duration);
  transition-property: background-color, color;
}

.game-button[data-kind="Reply"]:enabled:is(:hover, :focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(hoverDuration);
  outline: none;
  background-color: v-bind(GAME_REPLY_HOVER);
  color: v-bind(GAME_REPLY_HOVER_INK);
}

.game-button[data-kind="Reply"]:enabled:is(:active, [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  background-color: v-bind(GAME_REPLY_HOVER);
  color: v-bind(GAME_REPLY_HOVER_INK);
}

/* The game draws no state for a plain button, so a keyboard's focus is ringed in the white its pills light in */
.game-button[data-kind="Plain"]:focus-visible {
  outline: calc(var(--unit) * 3) solid #fff;
  outline-offset: calc(var(--unit) * -2);
}

@media (prefers-reduced-motion: reduce) {
  .game-button[data-kind="Disc"] > :slotted(*) {
    transition: none;
  }
}
</style>

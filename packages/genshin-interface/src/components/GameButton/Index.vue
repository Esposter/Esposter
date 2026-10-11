<script setup lang="ts">
import type { GameButtonKind } from "#src/models/GameButtonKind";

import { GAME_CREAM, GAME_GOLD, INTERACTION_HOVER_MS, INTERACTION_REST_MS } from "#src/services/constants";

interface Props {
  // The game's button template it is drawn as, which decides its look in each state
  kind: GameButtonKind;
  // The name a lit Disc shows beside it, as the side bar's buttons each show theirs, which also names it for a reader
  tip?: string;
}

const { kind, tip } = defineProps<Props>();
const button = useTemplateRef("button");
const hoverDuration = `${INTERACTION_HOVER_MS}ms`;
const restDuration = `${INTERACTION_REST_MS}ms`;
// A dialog moves the keyboard's focus to its button
defineExpose({ focus: () => button.value?.focus() });
</script>

<template>
  <!-- One of the game's buttons, placed by its parent, in its kind's look for each state: at rest, hovered (or focused
       From the keyboard, which the game draws as a hover) and disabled. The look is the button's own, and its content
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
   The hover's and out over the rest's */
.game-button {
  --state-duration: v-bind(restDuration);
  transition: color var(--state-duration);
}

.game-button:enabled:is(:hover, :focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(hoverDuration);
}

/* The side bar's icon, gold at rest. Hovered, a translucent navy disc 65 units across lights behind it, centred on its
   Ink, and the icon turns cream and grows by 1.12, its ink's area fitted at rest and hovered: the current English PC
   Client's settings gear at 1080 high (`yt-5EmJX_RyuY8-menu-settings` at 9.8 and 10.5 seconds). The disc's colour is
   Fitted over two side bars' greens, the same recording's and a 2024 one's (`yt-kIDee7nyD0w-menu-quit-prompt`) */
.game-button[data-kind="Disc"] {
  isolation: isolate;
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

/* An unbuilt screen's button, which the game never has, is drawn faded and answers nothing */
.game-button[data-kind="Disc"]:disabled {
  opacity: 0.4;
}

/* The lit icon's name, in a translucent dark slate box 31 units high, centred on the icon and starting 49.5 units right
   Of its centre, 5 past the side bar's edge, its words 17 units to their caps: the same frame's "Settings" */
.tip {
  position: absolute;
  top: 50%;
  left: calc(50% + var(--unit) * 49.5);
  padding: 0 calc(var(--unit) * 9);
  border-radius: calc(var(--unit) * 3);
  background: rgb(55 57 79 / 0.7);
  color: #d8dbe5;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  line-height: calc(var(--unit) * 31);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--state-duration);
  translate: 0 -50%;
}

.game-button:enabled:is(:hover, :focus-visible, [data-interaction-state="Hover"] *) > .tip {
  opacity: 1;
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

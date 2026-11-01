<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GAME_CREAM, GAME_GOLD } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div class="ribbon">
    <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">
      <svg viewBox="0 0 67 67" aria-hidden="true">
        <path d="M0 0h25L0 25zM67 0v25L42 0zM67 67H42l25-25zM0 67V42l25 25z" />
        <path d="M8 8l51 51M59 8L8 59" stroke-width="13" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* The slate banner over the cover's edge, its cross 67 square and 8 left of the banner's middle */
.ribbon {
  position: absolute;
  top: calc(var(--reference-pixel) * 183);
  left: calc(var(--reference-pixel) * 2887);
  display: grid;
  width: calc(var(--reference-pixel) * 158);
  height: calc(var(--reference-pixel) * 143);
  box-sizing: border-box;
  padding-right: calc(var(--reference-pixel) * 16);
  background: #384c5f;
  place-items: center;
}

.close {
  display: grid;
  padding: 0;
  border: none;
  background: transparent;
  cursor: inherit;
}

.close svg {
  width: calc(var(--reference-pixel) * 67);
  height: calc(var(--reference-pixel) * 67);
  fill: #d4bfb3;
  stroke: #d4bfb3;
}

/* The cross turns cream when a pointer hovers it (only a pointer's, so a tap leaves none) or focus lights it, as a Disc's
   icon does, and gold while pressed. Provisional, as no recording shows this cross under the pointer */
@media (hover: hover) {
  .close:enabled:hover svg {
    fill: v-bind(GAME_CREAM);
    stroke: v-bind(GAME_CREAM);
  }
}

.close:enabled:is(:focus-visible, [data-interaction-state="Hover"] *) svg {
  fill: v-bind(GAME_CREAM);
  stroke: v-bind(GAME_CREAM);
}

.close:enabled:is(:active, [data-interaction-state="Pressed"] *) svg {
  fill: v-bind(GAME_GOLD);
  stroke: v-bind(GAME_GOLD);
}
</style>

<script setup lang="ts">
import type { GameText } from "genshin-text";

import {
  GAME_CREAM,
  GAME_INK,
  INTERACTION_HOVER_DURATION,
  INTERACTION_REST_DURATION,
} from "genshin-interface/constants";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const closeButton = useTemplateRef("closeButton");
// The map is a dialog over the world, so focus starts inside it
onMounted(() => {
  closeButton.value?.focus();
});
</script>

<template>
  <button ref="closeButton" class="close" type="button" :aria-label="gameText[GameTextKey.Back]" @click="emit('close')">
    <svg viewBox="-1 -1 2 2" aria-hidden="true">
      <path
        d="M -0.7 -0.7 L 0.7 0.7 M 0.7 -0.7 L -0.7 0.7 M -0.7 -0.7 h 0.45 M -0.7 -0.7 v 0.45 M 0.7 -0.7 h -0.45 M 0.7 -0.7 v 0.45 M -0.7 0.7 h 0.45 M -0.7 0.7 v -0.45 M 0.7 0.7 h -0.45 M 0.7 0.7 v -0.45"
      />
    </svg>
  </button>
</template>

<style scoped>
.close {
  position: absolute;
  top: calc(var(--unit) * 19.5);
  right: calc(var(--unit) * 49);
  display: grid;
  width: calc(var(--unit) * 57);
  height: calc(var(--unit) * 57);
  padding: calc(var(--unit) * 7);
  border: calc(var(--unit) * 5) solid #849493;
  border-radius: 50%;
  background: #ece5d7;
  cursor: inherit;
  place-items: center;
  transition:
    background-color v-bind(INTERACTION_REST_DURATION),
    border-color v-bind(INTERACTION_REST_DURATION);
}

.close svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: #384150;
  stroke-width: 0.26;
}

/* Lit as the Pill's ring is, white over its rim and disc, and pressed the disc turns over: ink with its cross cream.
   Provisional, as no recording shows the close lit */
.close:is(:focus-visible, [data-interaction-state="Hover"] *) {
  border-color: #fff;
  background: #fff;
  transition-duration: v-bind(INTERACTION_HOVER_DURATION);
}

@media (hover: hover) {
  .close:hover {
    border-color: #fff;
    background: #fff;
    transition-duration: v-bind(INTERACTION_HOVER_DURATION);
  }
}

.close:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  border-color: v-bind(GAME_INK);
  background: v-bind(GAME_INK);
  transition-duration: 0s;
}

.close:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) svg {
  stroke: v-bind(GAME_CREAM);
}
</style>

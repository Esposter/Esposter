<script setup lang="ts">
import type { InteractionState } from "#src/models/InteractionState";

import {
  GAME_CANVAS_INSET,
  GAME_CANVAS_UNIT,
  GAME_CURSOR,
  GAME_FONT_FAMILY,
  GAME_UNIT,
  GAME_WHITE,
  MOBILE_INTERFACE_SCALE,
} from "#src/services/constants";
import { computed } from "vue";

interface Props {
  // The state every button on the screen is drawn in in place of the pointer's, which a fixture sets to shoot a hover,
  // Screens drawn inside it included
  interactionState?: InteractionState;
  // Whether the screen is the mobile client's, a quarter larger, in place of what the window's pointer says, which a
  // Fixture sets to shoot the touch layout on a desktop
  isTouch?: boolean;
}

const { interactionState, isTouch } = defineProps<Props>();
const style = computed(() =>
  isTouch === undefined ? undefined : { "--interface-scale": isTouch ? MOBILE_INTERFACE_SCALE : 1 },
);
</script>

<template>
  <!-- The root every screen of the game's is drawn in: the window's own container, whose `--unit` is a pixel of the
       Game's 1920 by 1080 screen, `--canvas-unit` a unit of its interface's 1600 by 900 canvas, both times
       `--interface-scale`, the mobile client's on a touch screen, `--canvas-inset` how far the canvas stands in from
       Each side and `--white` the white its opening is drawn on, in the game's face and pointer. Each resolves where a
       Child uses it, against this container -->
  <div class="game-screen" :data-interaction-state="interactionState" :style><slot /></div>
</template>

<style scoped>
.game-screen {
  --interface-scale: 1;
  --canvas-inset: v-bind(GAME_CANVAS_INSET);
  --canvas-unit: v-bind(GAME_CANVAS_UNIT);
  --unit: v-bind(GAME_UNIT);
  --white: v-bind(GAME_WHITE);
  position: absolute;
  inset: 0;
  overflow: hidden;
  container-type: size;
  cursor: v-bind(GAME_CURSOR);
  font-family: v-bind(GAME_FONT_FAMILY);
  user-select: none;
}

@media (pointer: coarse) {
  .game-screen {
    --interface-scale: v-bind(MOBILE_INTERFACE_SCALE);
  }
}
</style>

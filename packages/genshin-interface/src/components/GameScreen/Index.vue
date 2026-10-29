<script setup lang="ts">
import type { InteractionState } from "#src/models/InteractionState";

import {
  GAME_BACKDROP_BLUR,
  GAME_BACKDROP_KEEP,
  GAME_BACKDROP_WASH,
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
  // Whether the world behind the screen is blurred and washed as the game blurs it behind a full-screen menu, the screen's
  // Own pieces never blurred. Off unless a screen opts in, so every other screen draws what is behind it as it is
  isWorldBlurred?: boolean;
}

const { interactionState, isTouch } = defineProps<Props>();
const style = computed(() =>
  isTouch === undefined ? undefined : { "--interface-scale": isTouch ? MOBILE_INTERFACE_SCALE : 1 },
);
</script>

<template>
  <!-- The root every screen of the game's is drawn in: the window's own container, whose `--unit` is a pixel of the
       Game's 1920 by 1080 screen, or of the `--game-design-width` the screen sets on this root, `--canvas-unit` a unit
       of its interface's 1600 by 900 canvas, both times `--interface-scale`, the mobile client's on a touch screen,
       `--canvas-inset` how far the canvas stands in from
       Each side, `--white` the white its opening is drawn on and `--sparkle-clip-path` the four-pointed sparkle a star
       is clipped to, in the game's face and pointer. Each resolves where a
       Child uses it, against this container. A screen that opts in draws the world behind it blurred under its own
       Pieces, the blur taking what is painted behind this root and the wash added over it as light -->
  <div class="game-screen" :data-interaction-state="interactionState" :style>
    <div v-if="isWorldBlurred" class="world-backdrop">
      <div class="world-blur" />
      <div class="world-wash" />
    </div>
    <slot />
  </div>
</template>

<style scoped>
.game-screen {
  --interface-scale: 1;
  --canvas-inset: v-bind(GAME_CANVAS_INSET);
  --canvas-unit: v-bind(GAME_CANVAS_UNIT);
  --unit: v-bind(GAME_UNIT);
  --white: v-bind(GAME_WHITE);
  --sparkle-clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
  --backdrop-blur: v-bind(GAME_BACKDROP_BLUR);
  --backdrop-keep: v-bind(GAME_BACKDROP_KEEP);
  --backdrop-wash: v-bind(GAME_BACKDROP_WASH);
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

.world-backdrop {
  position: absolute;
  inset: 0;
}

/* The world behind the root, blurred and darkened to the share of it the game's screen keeps */
.world-blur {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(var(--backdrop-blur)) brightness(var(--backdrop-keep));
}

/* The wash added to the blurred world as light, so it brightens down the screen rather than covering it */
.world-wash {
  position: absolute;
  inset: 0;
  background: var(--backdrop-wash);
  mix-blend-mode: plus-lighter;
}
</style>

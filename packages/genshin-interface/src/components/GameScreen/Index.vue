<script setup lang="ts">
import {
  GAME_CANVAS_INSET,
  GAME_CANVAS_UNIT,
  GAME_CURSOR,
  GAME_FONT_FAMILY,
  GAME_UNIT,
  GAME_WHITE,
} from "#src/services/constants";
</script>

<template>
  <!-- The root every screen of the game's is drawn in: the window's own container, whose `--unit` is a pixel of the -->
  <!-- Game's 1920 by 1080 screen, `--canvas-unit` a unit of its interface's 1600 by 900 canvas and `--canvas-inset` how -->
  <!-- Far the canvas stands in from each side and `--white` the white its opening is drawn on, in the game's face and -->
  <!-- Pointer. Each resolves where a child uses it, -->
  <!-- Against this container -->
  <div class="game-screen"><slot /></div>
</template>

<style scoped>
.game-screen {
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
</style>

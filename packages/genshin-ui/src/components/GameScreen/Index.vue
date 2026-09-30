<script setup lang="ts">
import { GAME_CURSOR, GAME_EDGE_INSET, GAME_FONT_FAMILY, GAME_UNIT } from "#src/services/constants";
</script>

<template>
  <!-- The root every screen of the game's is drawn in: the window's own container, whose `--unit` is a pixel of the -->
  <!-- Game's 1920 by 1080 screen and `--edge-inset` the corner buttons' margin, in the game's face and pointer. Both -->
  <!-- Resolve where a child uses them, against this container -->
  <div class="game-screen"><slot /></div>
</template>

<style scoped>
.game-screen {
  --edge-inset: v-bind(GAME_EDGE_INSET);
  --unit: v-bind(GAME_UNIT);
  position: absolute;
  inset: 0;
  overflow: hidden;
  container-type: size;
  cursor: v-bind(GAME_CURSOR);
  font-family: v-bind(GAME_FONT_FAMILY);
  user-select: none;
}
</style>

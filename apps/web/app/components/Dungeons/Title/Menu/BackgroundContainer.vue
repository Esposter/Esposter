<script setup lang="ts">
import { getTweenRange } from "#src/services/dungeons/animation/getTweenRange";
import {
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
  MENU_BACKGROUND_HEIGHT,
  MENU_BACKGROUND_WIDTH,
} from "#src/services/dungeons/scene/title/menu/constants";
import { useTitleSceneStore } from "#src/store/dungeons/title/scene";
import { Container } from "vue-phaserjs";

const titleSceneStore = useTitleSceneStore();
const { playerTitleMenuOptionGrid } = titleSceneStore;
</script>

<template>
  <Container>
    <DungeonsUIGlassPanelNineSlice :width="MENU_BACKGROUND_WIDTH" :height="MENU_BACKGROUND_HEIGHT" />
    <DungeonsUIInputCursor
      :grid="playerTitleMenuOptionGrid"
      :initial-position="INITIAL_CURSOR_POSITION"
      :position-increment="CURSOR_POSITION_INCREMENT"
      :tween="{
        delay: 0,
        repeat: -1,
        duration: 500,
        x: getTweenRange(INITIAL_CURSOR_POSITION.x, INITIAL_CURSOR_POSITION.x + 3),
      }"
    />
  </Container>
</template>

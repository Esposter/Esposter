<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import { dayjs } from "@/services/dayjs";
import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/title/menu/constants";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";

const titleSceneStore = useTitleSceneStore();
const { optionGrid, cursorPositionMap } = storeToRefs(titleSceneStore);
</script>

<template>
  <Container>
    <DungeonsTitleMenuBackground />
    <DungeonsInputCursor
      :grid="optionGrid"
      :position-map="cursorPositionMap"
      :tween="{
        delay: 0,
        repeat: -1,
        duration: dayjs.duration(0.5, 'seconds').asMilliseconds(),
        x: {
          from: INITIAL_CURSOR_POSITION.x,
          start: INITIAL_CURSOR_POSITION.x,
          to: INITIAL_CURSOR_POSITION.x + 3,
        },
      }"
    />
  </Container>
</template>

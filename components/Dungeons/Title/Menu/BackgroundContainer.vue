<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import { dayjs } from "@/services/dayjs";
import { INITIAL_CURSOR_POSITION } from "@/services/dungeons/title/menu/constants";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";

const titleSceneStore = useTitleSceneStore();
const { optionGrid } = storeToRefs(titleSceneStore);
const titleCursorPositionIncrement = useTitleCursorPositionIncrement();
</script>

<template>
  <Container>
    <DungeonsTitleMenuBackground />
    <DungeonsUIInputCursor
      :grid="optionGrid"
      :initial-position="INITIAL_CURSOR_POSITION"
      :position-increment="titleCursorPositionIncrement"
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

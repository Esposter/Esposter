<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";
import { CURSOR_POSITION_INCREMENT, INITIAL_CURSOR_POSITION } from "@/services/dungeons/scene/title/menu/constants";
import { PlayerTitleMenuOptionGrid } from "@/services/dungeons/scene/title/menu/PlayerTitleMenuOptionGrid";
import { Container } from "vue-phaserjs";
</script>

<template>
  <Container>
    <DungeonsTitleMenuBackground />
    <DungeonsUIInputCursor
      :grid="PlayerTitleMenuOptionGrid"
      :initial-position="INITIAL_CURSOR_POSITION"
      :position-increment="CURSOR_POSITION_INCREMENT"
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

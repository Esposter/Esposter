<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { dayjs } from "@/services/dayjs";
import { INITIAL_CURSOR_POSITION, MENU_BACKGROUND_DISPLAY_WIDTH } from "@/services/dungeons/title/menu/constants";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";

const titleSceneStore = useTitleSceneStore();
const { optionGrid, cursorPositionMap } = storeToRefs(titleSceneStore);
</script>

<template>
  <Container>
    <Image
      :configuration="{
        x: 145,
        displayWidth: MENU_BACKGROUND_DISPLAY_WIDTH,
        textureKey: ImageKey.MenuBackground,
        origin: 0,
        scale: 2,
      }"
    />
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

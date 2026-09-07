<script setup lang="ts">
import { MENU_BACKGROUND_WIDTH } from "@/services/dungeons/scene/title/menu/constants";
import { Container, onCreate } from "vue-phaserjs";

const x = ref<number>();

onCreate((scene) => {
  x.value = (scene.scale.width - MENU_BACKGROUND_WIDTH) / 2;
});
</script>

<template>
  <Container :configuration="{ x, y: 300 }">
    <DungeonsTitleMenuBackgroundContainer />
    <DungeonsTitleMenuContent />
  </Container>
</template>

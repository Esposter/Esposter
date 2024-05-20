<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { MENU_BACKGROUND_WIDTH } from "@/services/dungeons/scene/title/menu/constants";

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

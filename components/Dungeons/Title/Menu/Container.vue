<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { MENU_BACKGROUND_DISPLAY_WIDTH } from "@/services/dungeons/title/menu/constants";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const menuContainerX = computed(() => scene.value.scale.width / 2 - MENU_BACKGROUND_DISPLAY_WIDTH / 2);
</script>

<template>
  <Container
    :configuration="{
      x: menuContainerX,
      y: 300,
    }"
  >
    <DungeonsTitleMenuBackgroundContainer />
    <DungeonsTitleMenuContent />
  </Container>
</template>

<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { MENU_DEPTH, MENU_HEIGHT, MENU_PADDING, MENU_WIDTH } from "@/services/dungeons/world/constants";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const worldSceneStore = useWorldSceneStore();
const { isMenuVisible } = storeToRefs(worldSceneStore);
const worldView = useWorldView();
const x = ref(worldView.value.right - MENU_PADDING * 2 - MENU_WIDTH);
const y = ref(worldView.value.top + MENU_PADDING * 2);

watch(isMenuVisible, (newIsMenuVisible) => {
  if (!newIsMenuVisible) return;

  x.value = worldView.value.right - MENU_PADDING * 2 - MENU_WIDTH;
  y.value = worldView.value.top + MENU_PADDING * 2;
});
</script>

<template>
  <Container :configuration="{ visible: isMenuVisible, x, y, depth: MENU_DEPTH }">
    <Rectangle
      :configuration="{
        x: 1,
        width: MENU_WIDTH - 1,
        height: MENU_HEIGHT - 1,
        origin: 0,
        fillColor: 0x32454c,
        alpha: 0.9,
        strokeStyle: [8, 0x6d9aa8],
      }"
    />
  </Container>
</template>

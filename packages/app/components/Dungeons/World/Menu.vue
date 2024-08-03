<script setup lang="ts">
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { getScene } from "@/lib/phaser/util/getScene";
import { MENU_PADDING, MENU_WIDTH } from "@/services/dungeons/scene/world/constants";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Position } from "grid-engine";

const worldSceneStore = useWorldSceneStore();
const { isMenuVisible, menuOptionGrid } = storeToRefs(worldSceneStore);
const position = ref<Position>();
const sceneKey = useInjectSceneKey();

watch(isMenuVisible, (newIsMenuVisible) => {
  if (!newIsMenuVisible) return;

  const scene = getScene(sceneKey);
  position.value = {
    x: scene.cameras.main.worldView.right - MENU_PADDING * 2 - MENU_WIDTH,
    y: scene.cameras.main.worldView.top + MENU_PADDING * 2,
  };
});
</script>

<template>
  <DungeonsUIMenu v-if="position" v-model:menu="isMenuVisible" v-model:grid="menuOptionGrid" :position />
</template>

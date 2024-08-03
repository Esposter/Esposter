<script setup lang="ts">
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { getScene } from "@/lib/phaser/util/getScene";
import { MENU_PADDING, MENU_WIDTH } from "@/services/dungeons/UI/menu/constants";
import { useMenuStore } from "@/store/dungeons/world/menu";
import type { Position } from "grid-engine";

const menuStore = useMenuStore();
const { isMenuVisible, menuOptionGrid } = storeToRefs(menuStore);
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

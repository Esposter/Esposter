<script setup lang="ts">
import type { Position } from "grid-engine";

import { WorldMenuOptionGrid } from "@/services/dungeons/scene/world/WorldMenuOptionGrid";
import { MENU_PADDING, MENU_WIDTH } from "@/services/dungeons/UI/menu/constants";
import { useMenuStore } from "@/store/dungeons/world/menu";
import { getScene, useInjectSceneKey } from "vue-phaserjs";

const menuStore = useMenuStore();
const { isMenuVisible } = storeToRefs(menuStore);
const position = ref<Position>();
const sceneKey = useInjectSceneKey();

watch(isMenuVisible, (newIsMenuVisible) => {
  if (!newIsMenuVisible) return;

  const scene = getScene(sceneKey);
  position.value = {
    x: scene.scale.width - MENU_PADDING * 2 - MENU_WIDTH,
    y: MENU_PADDING * 2,
  };
});
</script>

<template>
  <DungeonsUIMenu v-if="position" v-model:menu="isMenuVisible" :grid="WorldMenuOptionGrid" :position />
</template>

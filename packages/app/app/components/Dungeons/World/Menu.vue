<script setup lang="ts">
import type { Position } from "grid-engine";

import { WorldMenuOptionGrid } from "@/services/dungeons/scene/world/WorldMenuOptionGrid";
import { MENU_PADDING, MENU_WIDTH } from "@/services/dungeons/UI/menu/constants";
import { useMenuStore } from "@/store/dungeons/world/menu";
import { onUpdate } from "vue-phaserjs";

const menuStore = useMenuStore();
const { isMenuVisible } = storeToRefs(menuStore);
const position = ref<Position>();

onUpdate((scene) => {
  if (!isMenuVisible.value) return;
  position.value = {
    x: scene.cameras.main.worldView.right - MENU_PADDING * 2 - MENU_WIDTH,
    y: scene.cameras.main.worldView.top + MENU_PADDING * 2,
  };
});
</script>

<template>
  <DungeonsUIMenu v-if="position" v-model:menu="isMenuVisible" :grid="WorldMenuOptionGrid" :position />
</template>

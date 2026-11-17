<script setup lang="ts">
import type { Position } from "grid-engine";

import { MENU_PADDING, MENU_WIDTH } from "#src/services/dungeons/UI/menu/constants";
import { useWorldMenuStore } from "#src/store/dungeons/world/menu";
import { onUpdate } from "vue-phaserjs";

const worldMenuStore = useWorldMenuStore();
const { isMenuVisible } = storeToRefs(worldMenuStore);
const { worldMenuOptionGrid } = worldMenuStore;
const position = ref<Position>();

onUpdate((scene) => {
  if (!isMenuVisible.value) return;
  const x = scene.cameras.main.worldView.right - MENU_PADDING * 2 - MENU_WIDTH;
  const y = scene.cameras.main.worldView.top + MENU_PADDING * 2;
  // The camera moves in small steps, so most frames land on the position already shown, and a new object for it would
  // Re-render the menu every frame for nothing
  if (position.value?.x === x && position.value.y === y) return;
  position.value = { x, y };
});
</script>

<template>
  <DungeonsUIMenu v-if="position" v-model:is-visible="isMenuVisible" :grid="worldMenuOptionGrid" :position />
</template>

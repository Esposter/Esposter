<script setup lang="ts">
import { useNpcStore } from "@/store/dungeons/world/npc";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { takeOne } from "@esposter/shared";
import { onCreate } from "vue-phaserjs";

const worldSceneStore = useWorldSceneStore();
const { objectLayerMap } = storeToRefs(worldSceneStore);
const npcStore = useNpcStore();
const { resetCursorPaginationData } = npcStore;
const { items } = storeToRefs(npcStore);

// The layers are rebuilt for each tilemap, so the NPCs are read once they exist. The tilemap key changes before them,
// Which is why this follows the layers rather than the key
watch(objectLayerMap, () => {
  useReadNpcs();
});

onCreate(() => {
  // Leaving the scene resets the NPCs, so returning to a map that is already built reads it again
  if (objectLayerMap.value) useReadNpcs();
});

onUnmounted(() => {
  resetCursorPaginationData();
});
</script>

<template>
  <DungeonsWorldCharacterNpc
    v-for="({ id, asset, path, pathIndex, walkingAnimationMapping, singleSidedSpritesheetDirection }, index) of items"
    :id
    :key="id"
    v-model:direction="takeOne(items, index).direction"
    v-model:is-moving="takeOne(items, index).isMoving"
    :asset
    :path
    :path-index
    :walking-animation-mapping
    :single-sided-spritesheet-direction
  />
</template>

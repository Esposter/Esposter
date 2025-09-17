<script setup lang="ts">
import { useNpcStore } from "@/store/dungeons/world/npc";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { onCreate } from "vue-phaserjs";

const worldSceneStore = useWorldSceneStore();
const { tilemapKey } = storeToRefs(worldSceneStore);
const npcStore = useNpcStore();
const { resetCursorPaginationData } = npcStore;
const { items } = storeToRefs(npcStore);

const { trigger } = watchTriggerable(tilemapKey, () => {
  useReadNpcs();
});

onCreate(() => {
  trigger();
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
    v-model:direction="items[index].direction"
    v-model:is-moving="items[index].isMoving"
    :asset
    :path
    :path-index
    :walking-animation-mapping
    :single-sided-spritesheet-direction
  />
</template>

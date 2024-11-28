<script setup lang="ts">
import { useNpcStore } from "@/store/dungeons/world/npc";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { onCreate } from "vue-phaserjs";

const worldSceneStore = useWorldSceneStore();
const { tilemapKey } = storeToRefs(worldSceneStore);
const npcStore = useNpcStore();
const { resetCursorPaginationData } = npcStore;
const { npcList } = storeToRefs(npcStore);

const { trigger } = watchTriggerable(tilemapKey, () => {
  useReadNpcList();
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
    v-for="({ id, asset, path, pathIndex, walkingAnimationMapping, singleSidedSpritesheetDirection }, index) of npcList"
    :id
    :key="id"
    v-model:direction="npcList[index].direction"
    v-model:is-moving="npcList[index].isMoving"
    :asset
    :path
    :path-index
    :walking-animation-mapping
    :single-sided-spritesheet-direction
  />
</template>

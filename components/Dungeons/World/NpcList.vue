<script setup lang="ts">
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { useNpcStore } from "@/store/dungeons/world/npc";

const npcStore = useNpcStore();
const { resetCursorPaginationData } = npcStore;
const { npcList } = storeToRefs(npcStore);

onCreate(() => {
  useReadNpcList();
});

onShutdown(() => {
  resetCursorPaginationData();
});
</script>

<template>
  <DungeonsWorldCharacterNpc
    v-for="({ id, asset, path, pathIndex, walkingAnimationMapping, singleSidedSpritesheetDirection }, index) in npcList"
    :id
    :key="id"
    v-model:direction="npcList[index].direction"
    v-model:is-moving="npcList[index].isMoving"
    :asset="asset"
    :path="path"
    :path-index="pathIndex"
    :walking-animation-mapping="walkingAnimationMapping"
    :single-sided-spritesheet-direction="singleSidedSpritesheetDirection"
  />
</template>

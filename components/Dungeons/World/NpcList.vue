<script setup lang="ts">
import { useNpcStore } from "@/store/dungeons/world/npc";

const npcStore = useNpcStore();
const { npcList } = storeToRefs(npcStore);
</script>

<template>
  <DungeonsWorldCharacterNpc
    v-for="({ id, asset, path, pathIndex, walkingAnimationMapping, singleSidedSpritesheetDirection }, index) in npcList"
    :key="id"
    v-model:direction="npcList[index].direction"
    v-model:is-moving="npcList[index].isMoving"
    :character-id="id"
    :asset="asset"
    :path="path"
    :path-index="pathIndex"
    :walking-animation-mapping="walkingAnimationMapping"
    :single-sided-spritesheet-direction="singleSidedSpritesheetDirection"
  />
</template>

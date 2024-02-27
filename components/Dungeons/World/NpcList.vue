<script setup lang="ts">
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { useNpcStore } from "@/store/dungeons/world/npc";

const phaserStore = usePhaserStore();
const { sceneKey } = storeToRefs(phaserStore);
const npcStore = useNpcStore();
const { resetCursorPaginationData } = npcStore;
const { npcList } = storeToRefs(npcStore);

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, () => {
  resetCursorPaginationData();
});
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

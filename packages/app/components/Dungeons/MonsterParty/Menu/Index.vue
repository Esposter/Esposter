<script setup lang="ts">
import type { Position } from "grid-engine";

import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { MENU_PADDING, MENU_WIDTH } from "@/services/dungeons/UI/menu/constants";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { sceneMode } = storeToRefs(monsterPartySceneStore);
const monsterPartyMenuOptionGrid = useMonsterPartyMenuOptionGrid();
const position = ref<Position>();
const isMenuVisible = computed({
  get: () => sceneMode.value === SceneMode.Menu,
  set: (newIsMenuVisible) => {
    sceneMode.value = newIsMenuVisible ? SceneMode.Menu : SceneMode.Default;
  },
});

onCreate((scene) => {
  position.value = {
    x: scene.scale.width - MENU_PADDING * 2 - MENU_WIDTH,
    y: MENU_PADDING * 2,
  };
});
</script>

<template>
  <DungeonsUIMenu
    v-if="position"
    v-model:menu="isMenuVisible"
    :grid="monsterPartyMenuOptionGrid"
    :position="position"
  />
</template>

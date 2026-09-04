<script setup lang="ts">
import type { Position } from "grid-engine";

import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { getMenuPosition } from "@/services/dungeons/UI/menu/getMenuPosition";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { onCreate } from "vue-phaserjs";

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
  position.value = getMenuPosition(scene);
});
</script>

<template>
  <DungeonsUIMenu v-if="position" v-model:is-visible="isMenuVisible" :grid="monsterPartyMenuOptionGrid" :position />
</template>

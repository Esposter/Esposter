<script setup lang="ts">
import { SceneMode } from "#src/models/dungeons/scene/monsterParty/SceneMode";
import { useMonsterPartyMenuStore } from "#src/store/dungeons/monsterParty/menu";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { sceneMode } = storeToRefs(monsterPartySceneStore);
const monsterPartyMenuStore = useMonsterPartyMenuStore();
const { monsterPartyMenuOptionGrid } = monsterPartyMenuStore;
const position = useMenuPosition();
const isMenuVisible = computed({
  get: () => sceneMode.value === SceneMode.Menu,
  set: (newIsMenuVisible) => {
    sceneMode.value = newIsMenuVisible ? SceneMode.Menu : SceneMode.Default;
  },
});
</script>

<template>
  <DungeonsUIMenu v-if="position" v-model:is-visible="isMenuVisible" :grid="monsterPartyMenuOptionGrid" :position />
</template>

<script setup lang="ts">
import { SceneMode } from "#src/models/dungeons/scene/monsterParty/SceneMode";
import { useConfirmationMenuStore } from "#src/store/dungeons/monsterParty/confirmationMenu";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { sceneMode } = storeToRefs(monsterPartySceneStore);
const confirmationMenuStore = useConfirmationMenuStore();
const { monsterPartyConfirmationMenuOptionGrid, onDismiss } = confirmationMenuStore;
const position = useMenuPosition();
const isMenuVisible = computed({
  get: () => sceneMode.value === SceneMode.Confirmation,
  set: (newIsMenuVisible) => {
    if (newIsMenuVisible) sceneMode.value = SceneMode.Confirmation;
    else onDismiss();
  },
});
</script>

<template>
  <DungeonsUIMenu
    v-if="position"
    v-model:is-visible="isMenuVisible"
    :grid="monsterPartyConfirmationMenuOptionGrid"
    :position
  />
</template>

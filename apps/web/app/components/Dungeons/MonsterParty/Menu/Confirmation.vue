<script setup lang="ts">
import type { Position } from "grid-engine";

import { SceneMode } from "#src/models/dungeons/scene/monsterParty/SceneMode";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "#src/services/dungeons/scene/monsterParty/constants";
import { getMenuPosition } from "#src/services/dungeons/UI/menu/getMenuPosition";
import { useConfirmationMenuStore } from "#src/store/dungeons/monsterParty/confirmationMenu";
import { useMonsterPartyInfoPanelStore } from "#src/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { onCreate } from "vue-phaserjs";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { sceneMode } = storeToRefs(monsterPartySceneStore);
const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
const { infoDialogMessage } = storeToRefs(monsterPartyInfoPanelStore);
const confirmationMenuStore = useConfirmationMenuStore();
const { monsterPartyConfirmationMenuOptionGrid } = confirmationMenuStore;
const position = ref<Position>();
const isMenuVisible = computed({
  get: () => sceneMode.value === SceneMode.Confirmation,
  set: (newIsMenuVisible) => {
    if (newIsMenuVisible) {
      sceneMode.value = SceneMode.Confirmation;
      return;
    }

    sceneMode.value = SceneMode.Default;
    infoDialogMessage.value.text = DEFAULT_INFO_DIALOG_MESSAGE;
  },
});

onCreate((scene) => {
  position.value = getMenuPosition(scene);
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

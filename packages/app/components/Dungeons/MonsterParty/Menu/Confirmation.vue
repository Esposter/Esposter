<script setup lang="ts">
import type { Position } from "grid-engine";

import { SceneMode } from "@/models/dungeons/scene/monsterParty/SceneMode";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "@/services/dungeons/scene/monsterParty/constants";
import { MonsterPartyConfirmationMenuOptionGrid } from "@/services/dungeons/scene/monsterParty/MonsterPartyConfirmationMenuOptionGrid";
import { MENU_PADDING, MENU_WIDTH } from "@/services/dungeons/UI/menu/constants";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { onCreate } from "vue-phaserjs";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { sceneMode } = storeToRefs(monsterPartySceneStore);
const infoPanelStore = useInfoPanelStore();
const { infoDialogMessage } = storeToRefs(infoPanelStore);
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
    :grid="MonsterPartyConfirmationMenuOptionGrid"
    :position
  />
</template>

<script setup lang="ts">
import { ActivePanel } from "#src/models/dungeons/scene/battle/menu/ActivePanel";
import { BLANK_VALUE } from "#src/services/shared/constants";
import { useBattleSceneStore } from "#src/store/dungeons/battle/scene";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const { attackOptionGrid } = battleSceneStore;
</script>

<template>
  <DungeonsBattleMenuPanelGrid
    :get-text="(attack) => attack?.id ?? BLANK_VALUE"
    :grid="attackOptionGrid"
    :is-visible="activePanel === ActivePanel.AttackOption"
  />
</template>

<script setup lang="ts">
import { ActivePanel } from "#src/models/dungeons/scene/battle/menu/ActivePanel";
import { useBattleSceneStore } from "#src/store/dungeons/battle/scene";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const { playerBattleMenuOptionGrid } = battleSceneStore;
</script>

<template>
  <DungeonsBattleMenuPanelGrid
    :get-text="(playerOption) => playerOption"
    :grid="playerBattleMenuOptionGrid"
    :is-visible="activePanel === ActivePanel.Option"
    :x="520"
  />
</template>

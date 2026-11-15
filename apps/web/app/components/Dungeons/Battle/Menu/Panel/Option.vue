<script setup lang="ts">
import { ActivePanel } from "#src/models/dungeons/scene/battle/menu/ActivePanel";
import { PlayerBattleMenuOptionGrid } from "#src/services/dungeons/scene/battle/menu/PlayerBattleMenuOptionGrid";
import { useBattleSceneStore } from "#src/store/dungeons/battle/scene";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
</script>

<template>
  <DungeonsBattleMenuPanelGrid
    :get-text="(playerOption) => playerOption"
    :grid="PlayerBattleMenuOptionGrid"
    :is-visible="activePanel === ActivePanel.Option"
    :x="520"
  />
</template>

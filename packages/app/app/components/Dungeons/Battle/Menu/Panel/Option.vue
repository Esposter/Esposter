<script setup lang="ts">
import { ActivePanel } from "@/models/dungeons/scene/battle/menu/ActivePanel";
import { PlayerBattleMenuOptionGrid } from "@/services/dungeons/scene/battle/menu/PlayerBattleMenuOptionGrid";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";

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

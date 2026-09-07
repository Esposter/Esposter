<script setup lang="ts">
import { ActivePanel } from "@/models/dungeons/scene/battle/menu/ActivePanel";
import { BLANK_VALUE } from "@/services/shared/constants";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const attackOptionGrid = useAttackOptionGrid();
</script>

<template>
  <DungeonsBattleMenuPanelGrid
    :get-text="(attack) => attack?.id ?? BLANK_VALUE"
    :grid="attackOptionGrid"
    :is-visible="activePanel === ActivePanel.AttackOption"
  />
</template>

<script setup lang="ts">
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { monstersGrid } = storeToRefs(monsterPartySceneStore);
</script>

<template>
  <template v-for="(row, rowIndex) in monstersGrid" :key="rowIndex">
    <DungeonsMonsterPartyPanelListItem
      v-for="(monster, columnIndex) in row"
      :key="columnIndex"
      :row-index="rowIndex"
      :column-index="columnIndex"
      :monster="monster"
    />
  </template>
</template>

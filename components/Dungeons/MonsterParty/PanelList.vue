<script setup lang="ts">
import type { Monster } from "@/models/dungeons/monster/Monster";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { monsters } = storeToRefs(monsterPartySceneStore);
const rowSize = 3;
const columnSize = 2;
const monstersGrid = computed(() => {
  const monstersGrid: Monster[][] = [];

  for (let i = 0; i < Math.min(monsters.value.length, rowSize * columnSize); i += columnSize)
    monstersGrid.push(monsters.value.slice(i, i + columnSize));

  return monstersGrid;
});
</script>

<template>
  <template v-for="(monstersRow, rowIndex) in monstersGrid" :key="rowIndex">
    <DungeonsMonsterPartyPanelListItem
      v-for="(monster, columnIndex) in monstersRow"
      :key="columnIndex"
      :row-index="rowIndex"
      :column-index="columnIndex"
      :monster="monster"
    />
  </template>
</template>

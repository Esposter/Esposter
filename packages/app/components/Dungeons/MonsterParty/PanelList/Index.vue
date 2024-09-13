<script setup lang="ts">
import { getGridKey } from "@/services/dungeons/getGridKey";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { monstersGrid } = storeToRefs(monsterPartySceneStore);
</script>

<template>
  <template v-for="(row, rowIndex) in monstersGrid" :key="rowIndex">
    <DungeonsMonsterPartyPanelListItem
      v-for="(monster, columnIndex) in row"
      :key="getGridKey(rowIndex, columnIndex)"
      :row-index
      :column-index
      :monster
    />
  </template>
</template>

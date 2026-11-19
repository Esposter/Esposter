<script setup lang="ts">
import { getPositionId } from "#src/services/dungeons/direction/getPositionId";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { monstersGrid } = storeToRefs(monsterPartySceneStore);
</script>

<template>
  <template v-for="(row, rowIndex) of monstersGrid" :key="rowIndex">
    <DungeonsMonsterPartyPanelListItem
      v-for="(monster, columnIndex) of row"
      :key="getPositionId({ x: columnIndex, y: rowIndex })"
      :row-index
      :column-index
      :monster
    />
  </template>
</template>

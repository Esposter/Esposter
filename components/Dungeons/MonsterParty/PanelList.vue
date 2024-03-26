<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

const monsterPartySceneStore = useMonsterPartySceneStore();
const { monsters } = storeToRefs(monsterPartySceneStore);
const displayMonstersGrid = computed(() => {
  const displayMonstersGrid: Monster[][] = [];
  const rowSize = 3;
  const columnSize = 2;

  for (let i = 0; i < Math.min(monsters.value.length, rowSize * columnSize); i += columnSize)
    displayMonstersGrid.push(monsters.value.slice(i, i + columnSize));

  return displayMonstersGrid;
});
</script>

<template>
  <template v-for="(displayMonstersRow, rowIndex) in displayMonstersGrid" :key="rowIndex">
    <Image
      v-for="(displayMonster, columnIndex) in displayMonstersRow"
      :key="columnIndex"
      :configuration="{
        x: columnIndex * 510,
        y: rowIndex * 150 + columnIndex * 30 + 10,
        texture: ImageKey.HealthBarBackground,
        origin: 0,
        scaleX: 1.1,
        scaleY: 1.2,
      }"
    />
  </template>
</template>

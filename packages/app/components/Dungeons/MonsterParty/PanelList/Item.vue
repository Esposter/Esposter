<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { Monster } from "@/models/dungeons/monster/Monster";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import deepEqual from "deep-equal";
import { Input } from "phaser";

interface PanelListItemProps {
  rowIndex: number;
  columnIndex: number;
  monster: Monster;
}

const { rowIndex, columnIndex, monster } = defineProps<PanelListItemProps>();
const monsterPartySceneStore = useMonsterPartySceneStore();
const { optionGrid } = storeToRefs(monsterPartySceneStore);
const onGridClick = useOnGridClick(optionGrid, () => ({ x: columnIndex, y: rowIndex }));
const isActive = computed(() => deepEqual({ x: columnIndex, y: rowIndex }, optionGrid.value.position));
const healthBarPercentage = computed(() => (monster.currentHp / monster.stats.maxHp) * 100);
</script>

<template>
  <Container
    :configuration="{
      x: columnIndex * 510,
      y: rowIndex * 150 + (columnIndex % 2) * 30 + 10,
    }"
  >
    <Image
      :configuration="{
        texture: ImageKey.HealthBarBackground,
        origin: 0,
        scaleX: 1.1,
        scaleY: 1.2,
        alpha: isActive ? 1 : 0.7,
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
    />
    <Image
      :configuration="{
        x: 35,
        y: 20,
        texture: monster.asset.key,
        origin: 0,
        scale: 0.35,
      }"
    />
    <Text
      :configuration="{
        x: 162,
        y: 36,
        text: monster.key,
        style: {
          color: 'white',
          fontSize: 30,
        },
      }"
    />
    <Text
      :configuration="{
        x: 26,
        y: 116,
        text: `LV. ${monster.currentLevel}`,
        style: {
          color: 'white',
          fontSize: 22,
        },
      }"
    />
    <Text
      :configuration="{
        x: 164,
        y: 66,
        text: 'HP',
        style: {
          color: '#ff6505',
          fontSize: 24,
          fontStyle: 'italic',
        },
      }"
    />
    <DungeonsUIHealthBarContainer :position="{ x: 100, y: 40 }" :width="252" :bar-percentage="healthBarPercentage" />
    <Text
      :configuration="{
        x: 458,
        y: 95,
        originX: 1,
        originY: 0,
        text: `${monster.currentHp}/${monster.stats.maxHp}`,
        style: {
          color: 'white',
          fontSize: 38,
        },
      }"
    />
  </Container>
</template>
<script setup lang="ts">
import type { Monster } from "@/models/dungeons/monster/Monster";

import Container from "@/lib/phaser/components/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { BarType } from "@/models/dungeons/UI/bar/BarType";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import deepEqual from "fast-deep-equal";
import { Input } from "phaser";

interface PanelListItemProps {
  columnIndex: number;
  monster: Monster;
  rowIndex: number;
}

const { columnIndex, monster, rowIndex } = defineProps<PanelListItemProps>();
const monsterPartySceneStore = useMonsterPartySceneStore();
const { monsterPartyOptionGrid } = storeToRefs(monsterPartySceneStore);
const onGridClick = useOnGridClick(monsterPartyOptionGrid, () => ({ x: columnIndex, y: rowIndex }));
const isActive = computed(() => deepEqual({ x: columnIndex, y: rowIndex }, monsterPartyOptionGrid.value.position));
const barPercentage = computed(() => (monster.status.hp / monster.stats.maxHp) * 100);
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
        text: `LV. ${monster.stats.level}`,
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
    <DungeonsUIBarContainer
      :type="BarType.Health"
      :position="{ x: 100, y: 40 }"
      :width="252"
      :bar-percentage="barPercentage"
    />
    <Text
      :configuration="{
        x: 458,
        y: 95,
        originX: 1,
        originY: 0,
        text: `${monster.status.hp}/${monster.stats.maxHp}`,
        style: {
          color: 'white',
          fontSize: 38,
        },
      }"
    />
  </Container>
</template>

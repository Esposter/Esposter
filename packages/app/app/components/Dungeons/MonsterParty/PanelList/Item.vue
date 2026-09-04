<script setup lang="ts">
import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { HealthLabelTextStyle } from "@/assets/dungeons/styles/HealthLabelTextStyle";
import { BarType } from "@/models/dungeons/UI/bar/BarType";
import { prettify } from "@/util/text/prettify";
import deepEqual from "fast-deep-equal";
import { Input } from "phaser";
import { Container, Image, Text } from "vue-phaserjs";

interface Props {
  columnIndex: number;
  monster: Monster;
  rowIndex: number;
}

const { columnIndex, monster, rowIndex } = defineProps<Props>();
const monsterPartyOptionGrid = useMonsterPartyOptionGrid();
const onGridClick = useOnGridClick(monsterPartyOptionGrid, () => ({ x: columnIndex, y: rowIndex }));
const isActive = computed(() => deepEqual({ x: columnIndex, y: rowIndex }, monsterPartyOptionGrid.position.value));
const monsterName = computed(() => prettify(monster.key));
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
        text: monsterName,
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
        text: `LV. ${monster.statistics.level}`,
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
        style: HealthLabelTextStyle,
      }"
    />
    <DungeonsUIBarContainer
      :type="BarType.Health"
      :position="{ x: 100, y: 40 }"
      :width="252"
      :bar-percentage="(monster.status.health / monster.statistics.maxHealth) * 100"
    />
    <Text
      :configuration="{
        x: 458,
        y: 95,
        originX: 1,
        originY: 0,
        text: `${monster.status.health}/${monster.statistics.maxHealth}`,
        style: {
          color: 'white',
          fontSize: 38,
        },
      }"
    />
  </Container>
</template>

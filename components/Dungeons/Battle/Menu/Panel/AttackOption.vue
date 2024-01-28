<script setup lang="ts">
import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { ActivePanel } from "@/models/dungeons/battle/UI/menu/ActivePanel";
import { CursorPositionMap } from "@/services/dungeons/battle/UI/menu/CursorPositionMap";
import { MENU_HEIGHT, MENU_PADDING } from "@/services/dungeons/battle/UI/menu/constants";
import { getPlayerAttackOptionGrid } from "@/services/dungeons/battle/UI/menu/getPlayerAttackOptionGrid";
import { getAttackNames } from "@/services/dungeons/battle/getAttackNames";
import { useBattleSceneStore } from "~/store/dungeons/scene/battle";
import { usePlayerStore } from "~/store/dungeons/scene/battle/player";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const playerStore = usePlayerStore();
const { activeMonster } = storeToRefs(playerStore);
const attackNames = computed(() => getAttackNames(activeMonster.value));
const grid = computed(() => getPlayerAttackOptionGrid(attackNames.value));
</script>

<template>
  <Container v-if="activePanel === ActivePanel.AttackOption" :configuration="{ y: 448 }">
    <Rectangle
      :configuration="{
        width: 500,
        height: MENU_HEIGHT,
        origin: 0,
        fillColor: 0xede4f3,
        strokeStyle: [MENU_PADDING * 2, 0x905ac2],
      }"
    />
    <Text
      :configuration="{
        x: 55,
        y: 22,
        text: attackNames[0],
        style: battleUITextStyle,
      }"
    />
    <Text
      :configuration="{
        x: 240,
        y: 22,
        text: attackNames[1],
        style: battleUITextStyle,
      }"
    />
    <Text
      :configuration="{
        x: 55,
        y: 70,
        text: attackNames[2],
        style: battleUITextStyle,
      }"
    />
    <Text
      :configuration="{
        x: 240,
        y: 70,
        text: attackNames[3],
        style: battleUITextStyle,
      }"
    />
    <DungeonsBattleMenuCursor :grid="grid" :position-map="CursorPositionMap" />
  </Container>
</template>

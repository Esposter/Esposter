<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import { CursorPositionMap } from "@/services/dungeons/battle/menu/CursorPositionMap";
import { MENU_HEIGHT, MENU_PADDING } from "@/services/dungeons/battle/menu/constants";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { type Position } from "grid-engine";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const playerStore = usePlayerStore();
const { attackOptionGrid } = storeToRefs(playerStore);
const cursorPositions = computed(() => CursorPositionMap.flatMap<Position>((x) => x));
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
    <DungeonsBattleMenuPanelText
      v-for="({ x, y }, index) in cursorPositions"
      :key="index"
      v-model:grid="attackOptionGrid"
      :index="index"
      :position="{
        x: x + 12,
        y: y - 16,
      }"
    />
    <DungeonsBattleMenuCursor :grid="attackOptionGrid" :position-map="CursorPositionMap" />
  </Container>
</template>

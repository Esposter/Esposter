<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { ActivePanel } from "@/models/dungeons/battle/menu/ActivePanel";
import {
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
  MENU_HEIGHT,
  MENU_PADDING,
} from "@/services/dungeons/battle/menu/constants";
import { getPanelTextPosition } from "@/services/dungeons/battle/menu/getPanelTextPosition";
import { BLANK_VALUE } from "@/services/dungeons/constants";
import { usePlayerStore } from "@/store/dungeons/battle/player";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const playerStore = usePlayerStore();
const { attackOptionGrid } = storeToRefs(playerStore);
</script>

<template>
  <Container :configuration="{ visible: activePanel === ActivePanel.AttackOption, y: 448 }">
    <Rectangle
      :configuration="{
        width: 500,
        height: MENU_HEIGHT,
        origin: 0,
        fillColor: 0xede4f3,
        strokeStyle: [MENU_PADDING * 2, 0x905ac2],
      }"
    />
    <template v-for="(row, rowIndex) in attackOptionGrid.grid" :key="rowIndex">
      <DungeonsBattleMenuPanelText
        v-for="(_, columnIndex) in row"
        :key="`${rowIndex}|${columnIndex}`"
        v-model:grid="attackOptionGrid"
        :grid-position="{ x: columnIndex, y: rowIndex }"
        :text="attackOptionGrid.getValue({ x: columnIndex, y: rowIndex })?.name ?? BLANK_VALUE"
        :position="getPanelTextPosition(rowIndex, columnIndex)"
      />
    </template>
    <DungeonsInputCursor
      :grid="attackOptionGrid"
      :initial-position="INITIAL_CURSOR_POSITION"
      :position-increment="CURSOR_POSITION_INCREMENT"
    />
  </Container>
</template>

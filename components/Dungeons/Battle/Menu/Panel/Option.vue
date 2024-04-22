<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { ActivePanel } from "@/models/dungeons/scene/battle/menu/ActivePanel";
import { getGridKey } from "@/services/dungeons/getGridKey";
import {
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
  MENU_HEIGHT,
  MENU_PADDING,
} from "@/services/dungeons/scene/battle/menu/constants";
import { getPanelTextPosition } from "@/services/dungeons/scene/battle/menu/getPanelTextPosition";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
const battlePlayerStore = useBattlePlayerStore();
const { optionGrid } = storeToRefs(battlePlayerStore);
</script>

<template>
  <Container :configuration="{ visible: activePanel === ActivePanel.Option, x: 520, y: 448 }">
    <Rectangle
      :configuration="{
        origin: 0,
        width: 500,
        height: MENU_HEIGHT,
        fillColor: 0xede4f3,
        strokeStyle: [MENU_PADDING * 2, 0x905ac2],
      }"
    />
    <template v-for="(row, rowIndex) in optionGrid.grid" :key="rowIndex">
      <DungeonsBattleMenuPanelText
        v-for="(text, columnIndex) in row"
        :key="getGridKey(rowIndex, columnIndex)"
        v-model:grid="optionGrid"
        :grid-position="{ x: columnIndex, y: rowIndex }"
        :position="getPanelTextPosition(rowIndex, columnIndex)"
        :text
      />
    </template>
    <DungeonsUIInputCursor
      :grid="optionGrid"
      :initial-position="INITIAL_CURSOR_POSITION"
      :position-increment="CURSOR_POSITION_INCREMENT"
    />
  </Container>
</template>

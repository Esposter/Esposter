<script setup lang="ts">
import { ActivePanel } from "@/models/dungeons/scene/battle/menu/ActivePanel";
import { getGridKey } from "@/services/dungeons/getGridKey";
import {
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
  MENU_HEIGHT,
  MENU_PADDING,
} from "@/services/dungeons/scene/battle/menu/constants";
import { getPanelTextPosition } from "@/services/dungeons/scene/battle/menu/getPanelTextPosition";
import { PlayerBattleMenuOptionGrid } from "@/services/dungeons/scene/battle/menu/PlayerBattleMenuOptionGrid";
import { useBattleSceneStore } from "@/store/dungeons/battle/scene";
import { Container, Rectangle } from "vue-phaserjs";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
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
    <template v-for="(row, rowIndex) of unref(PlayerBattleMenuOptionGrid.grid)" :key="rowIndex">
      <DungeonsBattleMenuPanelText
        v-for="(text, columnIndex) of row"
        :key="getGridKey(rowIndex, columnIndex)"
        :grid="PlayerBattleMenuOptionGrid"
        :grid-position="{ x: columnIndex, y: rowIndex }"
        :position="getPanelTextPosition(rowIndex, columnIndex)"
        :text
      />
    </template>
    <DungeonsUIInputCursor
      :grid="PlayerBattleMenuOptionGrid"
      :initial-position="INITIAL_CURSOR_POSITION"
      :position-increment="CURSOR_POSITION_INCREMENT"
    />
  </Container>
</template>

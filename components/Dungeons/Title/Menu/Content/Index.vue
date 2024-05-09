<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/title/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerTitleMenuOption } from "@/models/dungeons/scene/title/menu/PlayerTitleMenuOption";
import { getGridKey } from "@/services/dungeons/getGridKey";
import { MENU_BACKGROUND_WIDTH } from "@/services/dungeons/scene/title/menu/constants";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";

const titleSceneStore = useTitleSceneStore();
const { isContinueEnabled, optionGrid } = storeToRefs(titleSceneStore);
</script>

<template>
  <template v-for="(row, rowIndex) in optionGrid.grid" :key="rowIndex">
    <DungeonsTitleMenuContentText
      v-for="(text, columnIndex) in row"
      :key="getGridKey(rowIndex, columnIndex)"
      :row-index="rowIndex"
      :column-index="columnIndex"
      :text="text"
    />
  </template>
  <Text
    :configuration="{
      visible: !isContinueEnabled,
      x: MENU_BACKGROUND_WIDTH / 2,
      y: 90,
      origin: 0.5,
      text: PlayerTitleMenuOption.Continue,
      style: MenuTextStyle,
      alpha: 0.5,
    }"
  />
</template>

<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/title/styles/MenuTextStyle";
import {
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
  MENU_BACKGROUND_WIDTH,
} from "@/services/dungeons/scene/title/menu/constants";
import { PlayerTitleMenuOptionGrid } from "@/services/dungeons/scene/title/menu/PlayerTitleMenuOptionGrid";
import { DISABLED_OPACITY } from "@/services/vuetify/constants";
import { Input } from "phaser";
import { Text } from "vue-phaserjs";

interface ContentTextProps {
  columnIndex: number;
  rowIndex: number;
  text: string;
}

const { columnIndex, rowIndex, text } = defineProps<ContentTextProps>();
const onGridClick = useOnGridClick(PlayerTitleMenuOptionGrid, () => ({ x: columnIndex, y: rowIndex }));
const isValid = computed(() => unref(PlayerTitleMenuOptionGrid.validate({ x: columnIndex, y: rowIndex })));
</script>

<template>
  <Text
    :configuration="{
      x: MENU_BACKGROUND_WIDTH / 2,
      y: INITIAL_CURSOR_POSITION.y + CURSOR_POSITION_INCREMENT.y * rowIndex - 1,
      origin: 0.5,
      text,
      style: MenuTextStyle,
      alpha: isValid ? 1 : DISABLED_OPACITY,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
  />
</template>

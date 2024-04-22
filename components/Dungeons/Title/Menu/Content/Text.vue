<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/title/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { INITIAL_CURSOR_POSITION, MENU_BACKGROUND_WIDTH } from "@/services/dungeons/scene/title/menu/constants";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";
import { Input } from "phaser";

interface ContentTextProps {
  rowIndex: number;
  columnIndex: number;
  text: string;
}

const { rowIndex, columnIndex, text } = defineProps<ContentTextProps>();
const titleSceneStore = useTitleSceneStore();
const { optionGrid } = storeToRefs(titleSceneStore);
const titleCursorPositionIncrement = useTitleCursorPositionIncrement();
const onGridClick = useOnGridClick(optionGrid, () => ({ x: columnIndex, y: rowIndex }));
</script>

<template>
  <Text
    :configuration="{
      x: MENU_BACKGROUND_WIDTH / 2,
      y: INITIAL_CURSOR_POSITION.y + titleCursorPositionIncrement.y * rowIndex - 1,
      origin: 0.5,
      text,
      style: MenuTextStyle,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
  />
</template>

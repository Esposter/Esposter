<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/world/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import {
  INITIAL_MENU_CURSOR_POSITION,
  MENU_CURSOR_POSITION_INCREMENT,
} from "@/services/dungeons/scene/world/constants";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Input } from "phaser";

interface ContentTextProps {
  rowIndex: number;
  columnIndex: number;
  text: string;
}

const { rowIndex, columnIndex, text } = defineProps<ContentTextProps>();
const worldSceneStore = useWorldSceneStore();
const { menuOptionGrid } = storeToRefs(worldSceneStore);
const onGridClick = useOnGridClick(menuOptionGrid, () => ({ x: columnIndex, y: rowIndex }));
</script>

<template>
  <Text
    :configuration="{
      x: INITIAL_MENU_CURSOR_POSITION.x + MENU_CURSOR_POSITION_INCREMENT.x * columnIndex + 20,
      y: INITIAL_MENU_CURSOR_POSITION.y + MENU_CURSOR_POSITION_INCREMENT.y * rowIndex - 18,
      text,
      style: MenuTextStyle,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
  />
</template>

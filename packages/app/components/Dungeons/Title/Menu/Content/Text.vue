<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/title/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import {
  CURSOR_POSITION_INCREMENT,
  INITIAL_CURSOR_POSITION,
  MENU_BACKGROUND_WIDTH,
} from "@/services/dungeons/scene/title/menu/constants";
import { DISABLED_OPACITY } from "@/services/vuetify/constants";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";
import { Input } from "phaser";

interface ContentTextProps {
  columnIndex: number;
  rowIndex: number;
  text: string;
}

const { columnIndex, rowIndex, text } = defineProps<ContentTextProps>();
const titleSceneStore = useTitleSceneStore();
const { optionGrid } = storeToRefs(titleSceneStore);
const onGridClick = useOnGridClick(optionGrid, () => ({ x: columnIndex, y: rowIndex }));
const isActive = computed(() => unref(optionGrid.value.getIsActive({ x: columnIndex, y: rowIndex })));
</script>

<template>
  <Text
    :configuration="{
      x: MENU_BACKGROUND_WIDTH / 2,
      y: INITIAL_CURSOR_POSITION.y + CURSOR_POSITION_INCREMENT.y * rowIndex - 1,
      origin: 0.5,
      text,
      style: MenuTextStyle,
      alpha: isActive ? 1 : DISABLED_OPACITY,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
  />
</template>

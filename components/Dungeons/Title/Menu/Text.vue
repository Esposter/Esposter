<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/title/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { PlayerTitleMenuOption } from "@/models/dungeons/title/menu/PlayerTitleMenuOption";
import { INITIAL_CURSOR_POSITION, MENU_BACKGROUND_DISPLAY_WIDTH } from "@/services/dungeons/title/menu/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";
import { Input } from "phaser";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const titleSceneStore = useTitleSceneStore();
const { isContinueEnabled, optionGrid } = storeToRefs(titleSceneStore);
const titleCursorPositionIncrement = useTitleCursorPositionIncrement();
</script>

<template>
  <template v-for="(row, rowIndex) in optionGrid.grid" :key="rowIndex">
    <Text
      v-for="(_, columnIndex) in row"
      :key="optionGrid.getIndex({ x: columnIndex, y: rowIndex })"
      :configuration="{
        x: MENU_BACKGROUND_DISPLAY_WIDTH / 2,
        y: INITIAL_CURSOR_POSITION.y + titleCursorPositionIncrement.y * rowIndex - 1,
        text: optionGrid.getValue(optionGrid.getIndex({ x: columnIndex, y: rowIndex })),
        style: MenuTextStyle,
        origin: 0.5,
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
        () => {
          const index = optionGrid.getIndex({ x: columnIndex, y: rowIndex });
          if (optionGrid.index === index) controls.setInput(PlayerSpecialInput.Confirm);
          else optionGrid.index = index;
        }
      "
    />
  </template>
  <Text
    :configuration="{
      visible: !isContinueEnabled,
      x: MENU_BACKGROUND_DISPLAY_WIDTH / 2,
      y: 90,
      text: PlayerTitleMenuOption.Continue,
      style: MenuTextStyle,
      origin: 0.5,
      alpha: 0.5,
    }"
  />
</template>

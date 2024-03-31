<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/title/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { PlayerTitleMenuOption } from "@/models/dungeons/title/menu/PlayerTitleMenuOption";
import { INITIAL_CURSOR_POSITION, MENU_BACKGROUND_WIDTH } from "@/services/dungeons/title/menu/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useTitleSceneStore } from "@/store/dungeons/title/scene";
import deepEqual from "deep-equal";
import type { Position } from "grid-engine";
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
      v-for="(text, columnIndex) in row"
      :key="`${rowIndex}|${columnIndex}`"
      :configuration="{
        x: MENU_BACKGROUND_WIDTH / 2,
        y: INITIAL_CURSOR_POSITION.y + titleCursorPositionIncrement.y * rowIndex - 1,
        text,
        style: MenuTextStyle,
        origin: 0.5,
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
        () => {
          const gridPosition: Position = { x: columnIndex, y: rowIndex };
          if (deepEqual(gridPosition, optionGrid.position)) controls.setInput(PlayerSpecialInput.Confirm);
          else optionGrid.position = gridPosition;
        }
      "
    />
  </template>
  <Text
    :configuration="{
      visible: !isContinueEnabled,
      x: MENU_BACKGROUND_WIDTH / 2,
      y: 90,
      text: PlayerTitleMenuOption.Continue,
      style: MenuTextStyle,
      origin: 0.5,
      alpha: 0.5,
    }"
  />
</template>

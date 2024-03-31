<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/world/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { INITIAL_MENU_CURSOR_POSITION, MENU_CURSOR_POSITION_INCREMENT } from "@/services/dungeons/world/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import deepEqual from "deep-equal";
import type { Position } from "grid-engine";
import { Input } from "phaser";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const worldSceneStore = useWorldSceneStore();
const { menuOptionGrid } = storeToRefs(worldSceneStore);
</script>

<template>
  <template v-for="(row, rowIndex) in menuOptionGrid.grid" :key="rowIndex">
    <Text
      v-for="(_, columnIndex) in row"
      :key="`${rowIndex}|${columnIndex}`"
      :configuration="{
        x: INITIAL_MENU_CURSOR_POSITION.x + MENU_CURSOR_POSITION_INCREMENT.x * columnIndex + 20,
        y: INITIAL_MENU_CURSOR_POSITION.y + MENU_CURSOR_POSITION_INCREMENT.y * rowIndex - 18,
        text: menuOptionGrid.getValue({ x: columnIndex, y: rowIndex }),
        style: MenuTextStyle,
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
        () => {
          const gridPosition: Position = { x: columnIndex, y: rowIndex };
          if (deepEqual(gridPosition, menuOptionGrid.position)) controls.setInput(PlayerSpecialInput.Confirm);
          else menuOptionGrid.position = gridPosition;
        }
      "
    />
  </template>
  <DungeonsUIInputCursor
    :cursor-image-key="ImageKey.CursorWhite"
    :grid="menuOptionGrid"
    :initial-position="INITIAL_MENU_CURSOR_POSITION"
    :position-increment="MENU_CURSOR_POSITION_INCREMENT"
  />
</template>

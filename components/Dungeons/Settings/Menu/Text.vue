<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/settings/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import {
  INITIAL_SETTINGS_POSITION,
  INITIAL_SETTINGS_VALUE_POSITION,
  SETTINGS_POSITION_INCREMENT,
  SETTINGS_VALUE_POSITION_INCREMENT,
} from "@/services/dungeons/settings/menu/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";
import deepEqual from "deep-equal";
import type { Position } from "grid-engine";
import { Input } from "phaser";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const settingsSceneStore = useSettingsSceneStore();
const { optionGrid } = storeToRefs(settingsSceneStore);
</script>

<template>
  <template v-for="(row, rowIndex) in optionGrid.grid" :key="rowIndex">
    <Text
      v-for="(_, columnIndex) in row"
      :key="optionGrid.getValue({ x: columnIndex, y: rowIndex })"
      :configuration="{
        x:
          columnIndex === 0
            ? INITIAL_SETTINGS_POSITION.x
            : INITIAL_SETTINGS_VALUE_POSITION.x + SETTINGS_VALUE_POSITION_INCREMENT.x * (columnIndex - 1),
        y: INITIAL_SETTINGS_POSITION.y + SETTINGS_POSITION_INCREMENT.y * rowIndex,
        text: optionGrid.getValue({ x: columnIndex, y: rowIndex }),
        style: MenuTextStyle,
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
        () => {
          // First column is the settings name
          if (columnIndex === 0) return;

          const gridPosition: Position = { x: columnIndex, y: rowIndex };
          if (deepEqual(gridPosition, optionGrid.position)) controls.setInput(PlayerSpecialInput.Confirm);
          else optionGrid.position = gridPosition;
        }
      "
    />
  </template>
</template>

<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/settings/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import {
  INITIAL_SETTINGS_POSITION,
  INITIAL_SETTINGS_VALUE_POSITION,
  SETTINGS_POSITION_INCREMENT,
  SETTINGS_VALUE_POSITION_INCREMENT,
} from "@/services/dungeons/settings/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";
import deepEqual from "deep-equal";
import type { Position } from "grid-engine";
import { Input } from "phaser";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);
const settingsSceneStore = useSettingsSceneStore();
const { optionGrid } = storeToRefs(settingsSceneStore);
</script>

<template>
  <template v-for="(row, rowIndex) in optionGrid.grid" :key="rowIndex">
    <Text
      v-for="(_, columnIndex) in row"
      :key="`${rowIndex}|${columnIndex}`"
      :configuration="{
        x:
          columnIndex === 0
            ? INITIAL_SETTINGS_POSITION.x
            : INITIAL_SETTINGS_VALUE_POSITION.x + SETTINGS_VALUE_POSITION_INCREMENT.x * (columnIndex - 1),
        y: INITIAL_SETTINGS_POSITION.y + SETTINGS_POSITION_INCREMENT.y * rowIndex,
        text: optionGrid.getValue({ x: columnIndex, y: rowIndex }),
        style: {
          ...MenuTextStyle,
          color:
            settings[optionGrid.getValue({ x: 0, y: rowIndex }) as keyof typeof settings] ===
            optionGrid.getValue({ x: columnIndex, y: rowIndex })
              ? '#ff2222'
              : '#fff',
        },
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
        () => {
          const gridPosition: Position = { x: columnIndex, y: rowIndex };
          if (deepEqual(gridPosition, optionGrid.position)) {
            if (optionGrid.value === SettingsOption.Close) controls.setInput(PlayerSpecialInput.Confirm);
            return;
          }

          optionGrid.position = gridPosition;
        }
      "
    />
  </template>
  <DungeonsSettingsMenuVolumeSlider />
  <DungeonsSettingsMenuColorPicker />
  <DungeonsSettingsMenuCursor />
</template>
@/models/dungeons/settings/SettingsSetting

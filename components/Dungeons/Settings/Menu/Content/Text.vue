<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/settings/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
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
import { Input } from "phaser";

interface ContentTextProps {
  rowIndex: number;
  columnIndex: number;
  text: string;
}

const { rowIndex, columnIndex, text } = defineProps<ContentTextProps>();
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);
const settingsSceneStore = useSettingsSceneStore();
const { optionGrid } = storeToRefs(settingsSceneStore);
const onGridClick = useOnGridClick(
  optionGrid,
  () => ({ x: columnIndex, y: rowIndex }),
  () => {
    if (optionGrid.value.value === SettingsOption.Close) controls.value.setInput(PlayerSpecialInput.Confirm);
  },
);
</script>

<template>
  <Text
    :configuration="{
      x:
        columnIndex === 0
          ? INITIAL_SETTINGS_POSITION.x
          : INITIAL_SETTINGS_VALUE_POSITION.x + SETTINGS_VALUE_POSITION_INCREMENT.x * (columnIndex - 1),
      y: INITIAL_SETTINGS_POSITION.y + SETTINGS_POSITION_INCREMENT.y * rowIndex,
      text,
      style: {
        ...MenuTextStyle,
        color:
          settings[optionGrid.getValue({ x: 0, y: rowIndex }) as keyof typeof settings] === text ? '#ff2222' : '#fff',
      },
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
  />
</template>

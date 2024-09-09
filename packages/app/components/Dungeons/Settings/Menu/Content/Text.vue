<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/settings/styles/MenuTextStyle";
import Text from "@/lib/phaser/components/Text.vue";
import { useInputStore } from "@/lib/phaser/store/input";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import {
  INITIAL_SETTINGS_POSITION,
  INITIAL_SETTINGS_VALUE_POSITION,
  SETTINGS_POSITION_INCREMENT,
  SETTINGS_VALUE_POSITION_INCREMENT,
} from "@/services/dungeons/scene/settings/constants";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { useSettingsStore } from "@/store/dungeons/settings";
import { Input } from "phaser";

interface ContentTextProps {
  columnIndex: number;
  rowIndex: number;
  text: string;
}

const { columnIndex, rowIndex, text } = defineProps<ContentTextProps>();
const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);
const onGridClick = useOnGridClick(
  SettingsOptionGrid,
  // We shouldn't be able to move to the settings option
  () => ({ x: columnIndex === 0 ? SettingsOptionGrid.position.value.x : columnIndex, y: rowIndex }),
  () => {
    if (SettingsOptionGrid.value === SettingsOption.Close) controls.value.setInput(PlayerSpecialInput.Confirm);
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
          settings[SettingsOptionGrid.getValue({ x: 0, y: rowIndex }) as keyof typeof settings] === text
            ? '#ff2222'
            : '#fff',
      },
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="onGridClick"
  />
</template>

<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { MenuTextStyle } from "@/assets/dungeons/scene/settings/styles/MenuTextStyle";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import {
  INITIAL_SETTINGS_POSITION,
  INITIAL_SETTINGS_VALUE_POSITION,
  SETTINGS_POSITION_INCREMENT,
} from "@/services/dungeons/scene/settings/constants";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";
import { Direction } from "grid-engine";
import { Input } from "phaser";
import { Image, Text } from "vue-phaserjs";

const colorPickerStore = useColorPickerStore();
const { updateThemeModeSetting } = colorPickerStore;
const { themeModeSetting } = storeToRefs(colorPickerStore);
const padding = 100;
const leftCursorX = INITIAL_SETTINGS_VALUE_POSITION.x + padding;
const textX = leftCursorX + padding;
const rightCursorX = textX + padding;
</script>

<template>
  <Image
    :configuration="{
      x: leftCursorX,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (SettingsOptionGrid.getPosition(SettingsOption['Theme Mode'])?.y ?? 0) +
        12,
      originX: 1,
      originY: 0,
      texture: FileKey.UICursorCursorWhite,
      scaleX: 2.5,
      flipX: true,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="updateThemeModeSetting(Direction.LEFT)"
  />
  <Text
    :configuration="{
      x: textX,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (SettingsOptionGrid.getPosition(SettingsOption['Theme Mode'])?.y ?? 0),
      originX: 0.5,
      originY: 0,
      text: themeModeSetting,
      style: MenuTextStyle,
    }"
  />
  <Image
    :configuration="{
      x: rightCursorX,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (SettingsOptionGrid.getPosition(SettingsOption['Theme Mode'])?.y ?? 0) +
        12,
      origin: 0,
      texture: FileKey.UICursorCursorWhite,
      scaleX: 2.5,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="updateThemeModeSetting(Direction.RIGHT)"
  />
</template>

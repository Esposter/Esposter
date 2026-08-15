<script setup lang="ts">
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { MenuTextStyle } from "@/assets/dungeons/scene/settings/styles/MenuTextStyle";
import { INITIAL_SETTINGS_VALUE_POSITION } from "@/services/dungeons/scene/settings/constants";
import { getSettingsOptionY } from "@/services/dungeons/scene/settings/getSettingsOptionY";
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
const y = getSettingsOptionY(SettingsOption["Theme Mode"]);
// The cursors are centred on the text rather than aligned to its top
const cursorY = y + 12;
</script>

<template>
  <Image
    :configuration="{
      x: leftCursorX,
      y: cursorY,
      originX: 1,
      originY: 0,
      texture: ImageKey.CursorWhite,
      scaleX: 2.5,
      flipX: true,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="updateThemeModeSetting(Direction.LEFT)"
  />
  <Text
    :configuration="{
      x: textX,
      y,
      originX: 0.5,
      originY: 0,
      text: themeModeSetting,
      style: MenuTextStyle,
    }"
  />
  <Image
    :configuration="{
      x: rightCursorX,
      y: cursorY,
      origin: 0,
      texture: ImageKey.CursorWhite,
      scaleX: 2.5,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="updateThemeModeSetting(Direction.RIGHT)"
  />
</template>

<script setup lang="ts">
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { MenuTextStyle } from "@/assets/dungeons/scene/settings/styles/MenuTextStyle";
import {
  THEME_MODE_PICKER_CURSOR_OFFSET_Y,
  THEME_MODE_PICKER_CURSOR_X,
  THEME_MODE_PICKER_PADDING,
  THEME_MODE_PICKER_TEXT_X,
} from "@/services/dungeons/scene/settings/constants";
import { getSettingsOptionY } from "@/services/dungeons/scene/settings/getSettingsOptionY";
import { useColorPickerStore } from "@/store/dungeons/settings/colorPicker";
import { Direction } from "grid-engine";
import { Input } from "phaser";
import { Image, Text } from "vue-phaserjs";

const colorPickerStore = useColorPickerStore();
const { updateThemeModeSetting } = colorPickerStore;
const { themeModeSetting } = storeToRefs(colorPickerStore);
const textY = getSettingsOptionY(SettingsOption["Theme Mode"]);
const cursorY = textY + THEME_MODE_PICKER_CURSOR_OFFSET_Y;
</script>

<template>
  <Image
    :configuration="{
      x: THEME_MODE_PICKER_CURSOR_X,
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
      x: THEME_MODE_PICKER_TEXT_X,
      y: textY,
      originX: 0.5,
      originY: 0,
      text: themeModeSetting,
      style: MenuTextStyle,
    }"
  />
  <Image
    :configuration="{
      x: THEME_MODE_PICKER_TEXT_X + THEME_MODE_PICKER_PADDING,
      y: cursorY,
      origin: 0,
      texture: ImageKey.CursorWhite,
      scaleX: 2.5,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="updateThemeModeSetting(Direction.RIGHT)"
  />
</template>

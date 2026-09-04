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
const PADDING = 100;
const LEFT_CURSOR_X = INITIAL_SETTINGS_VALUE_POSITION.x + PADDING;
const TEXT_X = LEFT_CURSOR_X + PADDING;
const TEXT_Y = getSettingsOptionY(SettingsOption["Theme Mode"]);
// The cursors are centred on the text rather than aligned to its top
const CURSOR_Y = TEXT_Y + 12;
</script>

<template>
  <Image
    :configuration="{
      x: LEFT_CURSOR_X,
      y: CURSOR_Y,
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
      x: TEXT_X,
      y: TEXT_Y,
      originX: 0.5,
      originY: 0,
      text: themeModeSetting,
      style: MenuTextStyle,
    }"
  />
  <Image
    :configuration="{
      x: TEXT_X + PADDING,
      y: CURSOR_Y,
      origin: 0,
      texture: ImageKey.CursorWhite,
      scaleX: 2.5,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="updateThemeModeSetting(Direction.RIGHT)"
  />
</template>

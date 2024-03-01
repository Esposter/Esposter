<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/settings/styles/MenuTextStyle";
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import {
  INITIAL_SETTINGS_POSITION,
  INITIAL_SETTINGS_VALUE_POSITION,
  SETTINGS_POSITION_INCREMENT,
} from "@/services/dungeons/settings/constants";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";

const settingsSceneStore = useSettingsSceneStore();
const { optionGrid } = storeToRefs(settingsSceneStore);
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
        SETTINGS_POSITION_INCREMENT.y * (optionGrid.getPosition(SettingsOption['Menu Color'])?.y ?? 0) +
        12,
      textureKey: ImageKey.CursorWhite,
      originX: 1,
      originY: 0,
      scaleX: 2.5,
      flipX: true,
    }"
  />
  <Text
    :configuration="{
      x: textX,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (optionGrid.getPosition(SettingsOption['Menu Color'])?.y ?? 0),
      text: 'White',
      style: MenuTextStyle,
      originX: 0.5,
      originY: 0,
    }"
  />
  <Image
    :configuration="{
      x: rightCursorX,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (optionGrid.getPosition(SettingsOption['Menu Color'])?.y ?? 0) +
        12,
      textureKey: ImageKey.CursorWhite,
      origin: 0,
      scaleX: 2.5,
    }"
  />
</template>

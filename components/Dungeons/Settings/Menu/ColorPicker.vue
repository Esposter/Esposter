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
</script>

<template>
  <Image
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 110,
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
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 130,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (optionGrid.getPosition(SettingsOption['Menu Color'])?.y ?? 0),
      text: 'White',
      style: MenuTextStyle,
      originY: 0,
    }"
  />
  <Image
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 240,
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

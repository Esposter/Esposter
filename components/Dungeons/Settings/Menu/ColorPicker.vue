<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/settings/styles/MenuTextStyle";
import Image from "@/lib/phaser/components/Image.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { PlayerSettingsMenuOption } from "@/models/dungeons/settings/menu/PlayerSettingsMenuOption";
import {
  INITIAL_SETTINGS_POSITION,
  INITIAL_SETTINGS_VALUE_POSITION,
  SETTINGS_POSITION_INCREMENT,
} from "@/services/dungeons/settings/menu/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const settingsSceneStore = useSettingsSceneStore();
const { optionGrid } = storeToRefs(settingsSceneStore);
</script>

<template>
  <Image
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 110,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (optionGrid.getPosition(PlayerSettingsMenuOption['Menu Color'])?.y ?? 0) +
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
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 170,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (optionGrid.getPosition(PlayerSettingsMenuOption['Menu Color'])?.y ?? 0),
      text: 'White',
      style: MenuTextStyle,
    }"
  />
  <Image
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 240,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (optionGrid.getPosition(PlayerSettingsMenuOption['Menu Color'])?.y ?? 0) +
        12,
      textureKey: ImageKey.CursorWhite,
      origin: 0,
      scaleX: 2.5,
    }"
  />
</template>

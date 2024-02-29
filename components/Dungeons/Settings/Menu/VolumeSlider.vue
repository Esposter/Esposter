<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/settings/styles/MenuTextStyle";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { PlayerSettingsOption } from "@/models/dungeons/settings/PlayerSettingsOption";
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
  <Rectangle
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (optionGrid.getPosition(PlayerSettingsOption.Volume)?.y ?? 0) +
        17,
      width: 300,
      height: 4,
      fillColor: 0xffffff,
      originX: 0,
      originY: 0.5,
    }"
  />
  <Rectangle
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 290,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (optionGrid.getPosition(PlayerSettingsOption.Volume)?.y ?? 0) +
        17,
      width: 10,
      height: 25,
      fillColor: 0xff2222,
      originX: 0,
      originY: 0.5,
    }"
  />
  <Text
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 340,
      y:
        INITIAL_SETTINGS_POSITION.y +
        SETTINGS_POSITION_INCREMENT.y * (optionGrid.getPosition(PlayerSettingsOption.Volume)?.y ?? 0),
      text: '100%',
      style: MenuTextStyle,
    }"
  />
</template>

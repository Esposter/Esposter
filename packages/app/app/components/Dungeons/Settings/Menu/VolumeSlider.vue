<script setup lang="ts">
import type { RectangleConfiguration } from "vue-phaserjs";

import { MenuTextStyle } from "@/assets/dungeons/scene/settings/styles/MenuTextStyle";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import {
  INITIAL_SETTINGS_POSITION,
  INITIAL_SETTINGS_VALUE_POSITION,
  MENU_HORIZONTAL_PADDING,
  SETTINGS_POSITION_INCREMENT,
  VOLUME_SLIDER_BAR_WIDTH,
  VOLUME_SLIDER_END_X,
  VOLUME_SLIDER_HEIGHT,
  VOLUME_SLIDER_START_X,
  VOLUME_SLIDER_WIDTH,
} from "@/services/dungeons/scene/settings/constants";
import { SettingsOptionGrid } from "@/services/dungeons/scene/settings/SettingsOptionGrid";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
import { Input } from "phaser";
import { Rectangle, Text } from "vue-phaserjs";

const volumeStore = useVolumeStore();
const { setVolume } = volumeStore;
const { volumePercentage, volumeSlider } = storeToRefs(volumeStore);
const baseY = computed(
  () =>
    INITIAL_SETTINGS_POSITION.y +
    SETTINGS_POSITION_INCREMENT.y * (SettingsOptionGrid.getPosition(SettingsOption.VolumePercentage)?.y ?? 0),
);
const baseSliderBarConfiguration = computed<Partial<RectangleConfiguration>>(() => ({
  originX: 0,
  originY: 0.5,
  width: VOLUME_SLIDER_BAR_WIDTH,
  x: INITIAL_SETTINGS_VALUE_POSITION.x,
  y: baseY.value + 17,
}));
const onSliderBarClick = async ({ x }: Input.Pointer) => {
  if (!volumeSlider.value) return;

  const volumeSliderWidth = VOLUME_SLIDER_END_X - VOLUME_SLIDER_START_X;
  const selectedVolumeSliderWidth = x - (MENU_HORIZONTAL_PADDING + VOLUME_SLIDER_START_X + VOLUME_SLIDER_WIDTH / 2);
  await setVolume(Math.floor((selectedVolumeSliderWidth / volumeSliderWidth) * 100));
};
</script>

<template>
  <Rectangle
    :configuration="{ ...baseSliderBarConfiguration, height: VOLUME_SLIDER_HEIGHT }"
    @[`${Input.Events.GAMEOBJECT_POINTER_DOWN}`]="onSliderBarClick"
  />
  <Rectangle
    :configuration="{ ...baseSliderBarConfiguration, height: 4, fillColor: 0xffffff }"
    @[`${Input.Events.GAMEOBJECT_POINTER_DOWN}`]="onSliderBarClick"
  />
  <Rectangle
    :configuration="{
      originX: 0,
      originY: 0.5,
      width: VOLUME_SLIDER_WIDTH,
      height: VOLUME_SLIDER_HEIGHT,
      fillColor: 0xff2222,
    }"
    :on-complete="
      (scene, rectangle) => {
        volumeSlider = useSlider(scene, rectangle, {
          endPoints: [
            { x: VOLUME_SLIDER_START_X, y: baseY + 17 },
            { x: VOLUME_SLIDER_END_X, y: baseY + 17 },
          ],
          value: volumePercentage / 100,
          // We want the sliding of the volume cursor to be smooth
          // so it will only be handled by the plugin instead of our store
          valuechangeCallback: (newValue) => setVolume(Math.floor(newValue * 100), false),
        });
      }
    "
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
      () => {
        if (!volumeSlider) return;
        // We just need to sync the slider to the valid volume value
        // once the user has finished deciding on the volume of the game
        volumeSlider.value = volumePercentage / 100;
      }
    "
  />
  <Text
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 340,
      y: baseY,
      text: `${volumePercentage}%`,
      style: MenuTextStyle,
    }"
  />
</template>

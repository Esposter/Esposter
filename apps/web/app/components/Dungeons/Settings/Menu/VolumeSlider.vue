<script setup lang="ts">
import type { RectangleConfiguration } from "vue-phaserjs";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { MenuTextStyle } from "@/assets/dungeons/scene/settings/styles/MenuTextStyle";
import {
  INITIAL_SETTINGS_VALUE_POSITION,
  MENU_HORIZONTAL_PADDING,
  VOLUME_SLIDER_BAR_WIDTH,
  VOLUME_SLIDER_END_X,
  VOLUME_SLIDER_HEIGHT,
  VOLUME_SLIDER_START_X,
  VOLUME_SLIDER_WIDTH,
} from "@/services/dungeons/scene/settings/constants";
import { getSettingsOptionY } from "@/services/dungeons/scene/settings/getSettingsOptionY";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
import { getResultAsync, noop } from "@esposter/shared";
import { Input } from "phaser";
import { Rectangle, Text } from "vue-phaserjs";

const volumeStore = useVolumeStore();
const { setVolume } = volumeStore;
const { volumePercentage, volumeSlider } = storeToRefs(volumeStore);
const BASE_Y = getSettingsOptionY(SettingsOption.VolumePercentage);
const BASE_SLIDER_BAR_CONFIGURATION: Partial<RectangleConfiguration> = {
  originX: 0,
  originY: 0.5,
  width: VOLUME_SLIDER_BAR_WIDTH,
  x: INITIAL_SETTINGS_VALUE_POSITION.x,
  y: BASE_Y + 17,
};
const onSliderBarClick = getSynchronizedFunction(({ x }: Input.Pointer) =>
  getResultAsync(async () => {
    if (!volumeSlider.value) return;

    const volumeSliderWidth = VOLUME_SLIDER_END_X - VOLUME_SLIDER_START_X;
    const selectedVolumeSliderWidth = x - (MENU_HORIZONTAL_PADDING + VOLUME_SLIDER_START_X + VOLUME_SLIDER_WIDTH / 2);
    await setVolume(Math.floor((selectedVolumeSliderWidth / volumeSliderWidth) * 100));
  }).match(noop, console.error),
);
</script>

<template>
  <Rectangle
    :configuration="{ ...BASE_SLIDER_BAR_CONFIGURATION, height: VOLUME_SLIDER_HEIGHT }"
    @[`${Input.Events.GAMEOBJECT_POINTER_DOWN}`]="onSliderBarClick"
  />
  <Rectangle
    :configuration="{ ...BASE_SLIDER_BAR_CONFIGURATION, height: 4, fillColor: 0xffffff }"
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
        volumeSlider = markRaw(
          useSlider(scene, rectangle, {
            endPoints: [
              { x: VOLUME_SLIDER_START_X, y: BASE_Y + 17 },
              { x: VOLUME_SLIDER_END_X, y: BASE_Y + 17 },
            ],
            value: volumePercentage / 100,
            // Keep cursor sliding smooth: handled by the plugin, not the store.
            valuechangeCallback: (newValue) => setVolume(Math.floor(newValue * 100), false),
          }),
        );
      }
    "
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
      () => {
        if (!volumeSlider) return;
        // Sync the slider to the valid volume once the user finishes adjusting.
        volumeSlider.value = volumePercentage / 100;
      }
    "
  />
  <Text
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 340,
      y: BASE_Y,
      text: `${volumePercentage}%`,
      style: MenuTextStyle,
    }"
  />
</template>

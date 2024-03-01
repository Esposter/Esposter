<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/settings/styles/MenuTextStyle";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import {
  INITIAL_SETTINGS_POSITION,
  INITIAL_SETTINGS_VALUE_POSITION,
  MENU_HORIZONTAL_PADDING,
  SETTINGS_POSITION_INCREMENT,
  VOLUME_SLIDER_BAR_WIDTH,
  VOLUME_SLIDER_END_X,
  VOLUME_SLIDER_START_X,
  VOLUME_SLIDER_WIDTH,
} from "@/services/dungeons/settings/constants";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useSettingsSceneStore } from "@/store/dungeons/settings/scene";
import { Input } from "phaser";

const settingsSceneStore = useSettingsSceneStore();
const { optionGrid } = storeToRefs(settingsSceneStore);
const settingsStore = useSettingsStore();
const { settings, volumeSlider } = storeToRefs(settingsStore);
const volume = computed(() => settings.value[SettingsOption.Volume] as number);
const baseY = computed(
  () =>
    INITIAL_SETTINGS_POSITION.y +
    SETTINGS_POSITION_INCREMENT.y * (optionGrid.value.getPosition(SettingsOption.Volume)?.y ?? 0),
);
</script>

<template>
  <Rectangle
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x,
      y: baseY + 17,
      width: VOLUME_SLIDER_BAR_WIDTH,
      height: 4,
      fillColor: 0xffffff,
      originX: 0,
      originY: 0.5,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_DOWN}`]="
      ({ x }: Input.Pointer) => {
        if (!volumeSlider) return;

        const volumeSliderWidth = VOLUME_SLIDER_END_X - VOLUME_SLIDER_START_X;
        const selectedVolumeSliderWidth =
          x - (MENU_HORIZONTAL_PADDING + VOLUME_SLIDER_START_X + VOLUME_SLIDER_WIDTH / 2);
        const newValue = selectedVolumeSliderWidth / volumeSliderWidth;
        settings[SettingsOption.Volume] = Math.floor(newValue * 100);
        volumeSlider.value = volume / 100;
      }
    "
  />
  <Rectangle
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 290,
      y: baseY + 17,
      width: VOLUME_SLIDER_WIDTH,
      height: 25,
      fillColor: 0xff2222,
      originX: 0,
      originY: 0.5,
    }"
    :on-complete="
      (rectangle) => {
        volumeSlider = useSlider(rectangle, {
          endPoints: [
            { x: VOLUME_SLIDER_START_X, y: baseY + 17 },
            { x: VOLUME_SLIDER_END_X, y: baseY + 17 },
          ],
          value: volume / 100,
          valuechangeCallback: (newValue) => {
            settings[SettingsOption.Volume] = Math.floor(newValue * 100);
          },
        });
      }
    "
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
      () => {
        if (!volumeSlider) return;
        // We just need to sync the slider to the valid volume value
        // once the user has finished deciding on the volume of the game
        volumeSlider.value = volume / 100;
      }
    "
  />
  <Text
    :configuration="{
      x: INITIAL_SETTINGS_VALUE_POSITION.x + 340,
      y: baseY,
      text: `${volume}%`,
      style: MenuTextStyle,
    }"
  />
</template>

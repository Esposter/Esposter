import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type Slider from "phaser4-rex-plugins/plugins/slider";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { useSettingsStore } from "#src/store/dungeons/settings/index";
import { step } from "#src/util/math/ease/step";
import { clamp } from "@vueuse/core";
import { Direction } from "grid-engine";

export const useVolumeStore = defineStore("dungeons/settings/volume", () => {
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const volumePercentage = computed(() => settingsStore.settings[SettingsOption.VolumePercentage]);
  const volumeDelta = ref(0);
  const volumeIncrementCooldown = ref(0);
  // Only what the store reads of the slider, so a test can hand it a slider without the rest of the plugin's type
  const volumeSlider = ref<Pick<Slider, "destroy" | "value">>();
  const setVolume = (baseVolumePercentage: number, isUpdateSlider = true) => {
    const clampedVolumePercentage = clamp(baseVolumePercentage, 0, 100);
    setSettings(SettingsOption.VolumePercentage, clampedVolumePercentage);

    if (!(volumeSlider.value && isUpdateSlider)) return;
    volumeSlider.value.value = clampedVolumePercentage / 100;
  };
  // The slider belongs to the scene that draws it, so the scene's shutdown destroys it and the store lets go of it too
  const destroyVolumeSlider = () => {
    volumeSlider.value?.destroy();
    volumeSlider.value = undefined;
  };
  const updateVolume = (direction: Direction, delta: number) => {
    volumeDelta.value += delta / Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
    const incrementSpeed = step(volumeDelta.value, [
      { speed: 0.1, threshold: 1 },
      { speed: 0.5, threshold: 3 },
      { speed: 1 },
    ]);
    const increment = 1;
    volumeIncrementCooldown.value -= incrementSpeed;
    if (volumeIncrementCooldown.value > 0) return;

    const newVolumePercentage =
      direction === Direction.LEFT && volumePercentage.value > 0
        ? volumePercentage.value - increment
        : direction === Direction.RIGHT && volumePercentage.value < 100
          ? volumePercentage.value + increment
          : undefined;
    if (newVolumePercentage === undefined) return;
    setVolume(newVolumePercentage);
    volumeIncrementCooldown.value += increment;
  };
  const checkIsUpdateVolume = (input: PlayerInput, settingsOption: SettingsOption): input is Direction => {
    const isUpdateVolume =
      settingsOption === SettingsOption.VolumePercentage && (input === Direction.LEFT || input === Direction.RIGHT);
    // Any other input means the direction key was lifted, so the held delta starts over
    if (!isUpdateVolume) {
      volumeDelta.value = 0;
      volumeIncrementCooldown.value = 0;
    }
    return isUpdateVolume;
  };

  return { checkIsUpdateVolume, destroyVolumeSlider, setVolume, updateVolume, volumePercentage, volumeSlider };
});

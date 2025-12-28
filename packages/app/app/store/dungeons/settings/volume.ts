import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type Slider from "phaser3-rex-plugins/plugins/slider";

import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { dayjs } from "#shared/services/dayjs";
import { useSettingsStore } from "@/store/dungeons/settings";
import { step } from "@/util/math/ease/step";
import { clamp } from "@vueuse/core";
import { Direction } from "grid-engine";

export const useVolumeStore = defineStore("dungeons/settings/volume", () => {
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const volumePercentage = computed(() => settingsStore.settings[SettingsOption.VolumePercentage]);
  const volumeDelta = ref(0);
  const volumeIncrementCooldown = ref(0);
  const volumeSlider = ref<Slider>();
  const setVolume = async (baseVolumePercentage: number, isUpdateSlider = true) => {
    const volumePercentage = clamp(baseVolumePercentage, 0, 100);
    await setSettings(SettingsOption.VolumePercentage, volumePercentage);

    if (!(volumeSlider.value && isUpdateSlider)) return;
    volumeSlider.value.value = volumePercentage / 100;
  };
  const updateVolume = async (direction: Direction, delta: number) => {
    volumeDelta.value += delta / dayjs.duration(1, "second").asMilliseconds();
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
        ? Math.max(volumePercentage.value - increment, 0)
        : direction === Direction.RIGHT && volumePercentage.value < 100
          ? Math.min(volumePercentage.value + increment, 100)
          : null;
    if (newVolumePercentage === null) return;
    await setVolume(newVolumePercentage);
    volumeIncrementCooldown.value += increment;
  };
  const isUpdateVolume = (input: PlayerInput, settingsOption: SettingsOption): input is Direction => {
    const isUpdateVolume =
      settingsOption === SettingsOption.VolumePercentage && (input === Direction.LEFT || input === Direction.RIGHT);
    // We can do a little bit of magic here if we're not updating the volume
    // And reset the volume delta metadata if it's not 0 since we know that the user
    // Has lifted the input direction key
    if (!isUpdateVolume) {
      if (volumeDelta.value !== 0) volumeDelta.value = 0;
      if (volumeIncrementCooldown.value !== 0) volumeIncrementCooldown.value = 0;
    }
    return isUpdateVolume;
  };

  return {
    isUpdateVolume,
    setVolume,
    updateVolume,
    volumePercentage,
    volumeSlider,
  };
});

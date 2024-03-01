import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { useSettingsStore } from "@/store/dungeons/settings";
import { Direction } from "grid-engine";
import type Slider from "phaser3-rex-plugins/plugins/slider";

export const useVolumeStore = defineStore("dungeons/settings/volume", () => {
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const { settings } = storeToRefs(settingsStore);
  const volume = computed(() => settings.value[SettingsOption.Volume] as number);
  const volumeSlider = ref<Slider>();
  const setVolume = (value: number, isUpdateSlider = true) => {
    if (!(value >= 0 && value <= 100)) throw new Error(`Invalid volume: ${value}`);
    setSettings(SettingsOption.Volume, value);

    if (!(volumeSlider.value && isUpdateSlider)) return;
    volumeSlider.value.value = value / 100;
  };
  const updateVolume = (direction: Direction) => {
    const volume = settings.value[SettingsOption.Volume] as number;
    const newVolume =
      direction === Direction.LEFT && volume > 0
        ? Math.max(volume - 1, 0)
        : direction === Direction.RIGHT && volume < 100
          ? Math.min(volume + 1, 100)
          : null;
    if (newVolume === null) return;
    setVolume(newVolume);
  };
  const isUpdateVolume = (input: PlayerInput, settingsOption: SettingsOption): input is Direction =>
    settingsOption === SettingsOption.Volume && (input === Direction.LEFT || input === Direction.RIGHT);
  return {
    volume,
    volumeSlider,
    setVolume,
    updateVolume,
    isUpdateVolume,
  };
});

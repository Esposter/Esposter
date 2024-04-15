import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { dayjs } from "@/services/dayjs";
import { useSettingsStore } from "@/store/dungeons/settings";
import { step } from "@/util/ease/step";
import { Direction } from "grid-engine";
import type Slider from "phaser3-rex-plugins/plugins/slider";

export const useVolumeStore = defineStore("dungeons/settings/volume", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const settingsStore = useSettingsStore();
  const { setSettings } = settingsStore;
  const { settings } = storeToRefs(settingsStore);
  const volume = computed(() => settings.value[SettingsOption.Volume]);
  const volumeDelta = ref(0);
  const volumeIncrementCooldown = ref(0);
  const volumeSlider = ref<Slider>();
  const setVolume = async (value: number, isUpdateSlider = true) => {
    if (!(value >= 0 && value <= 100)) throw new Error(`Invalid volume: ${value}`);
    await setSettings(SettingsOption.Volume, value);

    if (!(volumeSlider.value && isUpdateSlider)) return;
    volumeSlider.value.value = value / 100;
  };
  const updateVolume = async (direction: Direction, delta: number) => {
    volumeDelta.value += delta / dayjs.duration(1, "second").asMilliseconds();
    const incrementSpeed = step(volumeDelta.value, [
      { threshold: 1, speed: 0.1 },
      { threshold: 3, speed: 0.5 },
      { speed: 1 },
    ]);
    const increment = 1;
    volumeIncrementCooldown.value -= incrementSpeed;
    if (volumeIncrementCooldown.value > 0) return;

    const volume = settings.value[SettingsOption.Volume];
    const newVolume =
      direction === Direction.LEFT && volume > 0
        ? Math.max(volume - increment, 0)
        : direction === Direction.RIGHT && volume < 100
          ? Math.min(volume + increment, 100)
          : null;
    if (newVolume === null) return;
    await setVolume(newVolume);
    volumeIncrementCooldown.value += increment;
  };
  const isUpdateVolume = (input: PlayerInput, settingsOption: SettingsOption): input is Direction => {
    const isUpdateVolume =
      settingsOption === SettingsOption.Volume && (input === Direction.LEFT || input === Direction.RIGHT);
    // We can do a little bit of magic here if we're not updating the volume
    // and reset the volume delta metadata if it's not 0 since we know that the user
    // has lifted the input direction key
    if (!isUpdateVolume) {
      if (volumeDelta.value !== 0) volumeDelta.value = 0;
      if (volumeIncrementCooldown.value !== 0) volumeIncrementCooldown.value = 0;
    }
    return isUpdateVolume;
  };

  watch(volume, (newVolume) => {
    scene.value.sound.setVolume(newVolume);
  });

  return {
    volume,
    volumeSlider,
    setVolume,
    updateVolume,
    isUpdateVolume,
  };
});

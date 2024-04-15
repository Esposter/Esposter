import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SoundSetting } from "@/models/dungeons/data/settings/SoundSetting";
import type { SoundKey } from "@/models/dungeons/keys/SoundKey";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
import type { Except } from "@/util/types/Except";
import type { Types } from "phaser";

export const useDungeonsSound = (soundKey: SoundKey, options?: Except<Types.Sound.SoundConfig, "volume">) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);
  const volumeStore = useVolumeStore();
  const { volumePercentage } = storeToRefs(volumeStore);
  const volume = computed(() => volumePercentage.value / 100);

  watch(
    () => settings.value.Sound,
    (newSoundSetting) => {
      if (newSoundSetting === SoundSetting.On) return;
      scene.value.sound.stopByKey(soundKey);
    },
  );

  return {
    play: () => {
      if (settings.value.Sound !== SoundSetting.On) return;
      scene.value.sound.play(soundKey, { ...options, volume: volume.value });
    },
    stop: () => {
      if (settings.value.Sound !== SoundSetting.On) return;
      scene.value.sound.stopByKey(soundKey);
    },
  };
};

import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SoundSetting } from "@/models/dungeons/data/settings/SoundSetting";
import type { SoundKey } from "@/models/dungeons/keys/sound/SoundKey";
import { useSettingsStore } from "@/store/dungeons/settings";
import type { Types } from "phaser";

export const useDungeonsSound = (soundKey: SoundKey, options?: Types.Sound.SoundConfig) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);

  watch(
    () => settings.value.Sound,
    (newSoundSetting) => {
      scene.value.sound.setMute(newSoundSetting === SoundSetting.On);
    },
  );

  return {
    play: () => {
      scene.value.sound.play(soundKey, { ...options, volume: options?.volume ?? 1 });
    },
    stop: () => {
      scene.value.sound.stopByKey(soundKey);
    },
  };
};

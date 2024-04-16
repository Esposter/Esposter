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
  const autoStopped = ref(false);

  watch(
    () => settings.value.Sound,
    (newSoundSetting) => {
      const sound = scene.value.sound.get(soundKey);

      if (newSoundSetting === SoundSetting.Off) {
        if (!sound.isPlaying) return;
        else if (options?.loop) sound.pause();
        else sound.stop();
        autoStopped.value = true;
        return;
      }

      autoStopped.value = false;
      if (options?.loop) sound.resume();
    },
  );

  return {
    play: () => {
      if (settings.value.Sound === SoundSetting.On)
        scene.value.sound.play(soundKey, { ...options, volume: options?.volume ?? 1 });
    },
    stop: () => {
      if (settings.value.Sound === SoundSetting.On) scene.value.sound.stopByKey(soundKey);
    },
  };
};

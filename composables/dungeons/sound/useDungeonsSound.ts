import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { SoundKey } from "@/models/dungeons/keys/sound/SoundKey";
import type { Types } from "phaser";

export const useDungeonsSound = (soundKey: SoundKey, options?: Types.Sound.SoundConfig) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  return {
    play: () => {
      scene.value.sound.play(soundKey, { ...options, volume: options?.volume ?? 1 });
    },
    stop: () => {
      scene.value.sound.stopByKey(soundKey);
    },
  };
};

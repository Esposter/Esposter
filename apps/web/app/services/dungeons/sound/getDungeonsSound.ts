import type { SoundKey } from "@/models/dungeons/keys/sound/SoundKey";
import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

export const getDungeonsSound = (scene: SceneWithPlugins, soundKey: SoundKey, options?: Types.Sound.SoundConfig) => ({
  play: () => {
    scene.sound.play(soundKey, { ...options, volume: options?.volume ?? 1 });
  },
  stop: () => {
    scene.sound.stopByKey(soundKey);
  },
});

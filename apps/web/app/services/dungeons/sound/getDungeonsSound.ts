import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

export const getDungeonsSound = (scene: SceneWithPlugins, soundKey: FileKey, options?: Types.Sound.SoundConfig) => ({
  play: () => {
    scene.sound.play(soundKey, { ...options, volume: options?.volume ?? 1 });
  },
  stop: () => {
    scene.sound.stopByKey(soundKey);
  },
});

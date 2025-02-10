import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

export const getDungeonsSound = (scene: SceneWithPlugins, fileKey: FileKey, options?: Types.Sound.SoundConfig) => ({
  play: () => {
    scene.sound.play(fileKey, { ...options, volume: options?.volume ?? 1 });
  },
  stop: () => {
    scene.sound.stopByKey(fileKey);
  },
});

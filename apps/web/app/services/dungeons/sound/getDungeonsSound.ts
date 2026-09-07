import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

export const getDungeonsSound = (
  scene: SceneWithPlugins,
  soundKey: FileKey,
  { volume = 1, ...options }: Types.Sound.SoundConfig = {},
) => ({
  play: () => {
    scene.sound.play(soundKey, { ...options, volume });
  },
  stop: () => {
    scene.sound.stopByKey(soundKey);
  },
});

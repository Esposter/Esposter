import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import type { Types } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

export const getDungeonsSound = (
  scene: SceneWithPlugins,
  soundKey: DungeonsKey,
  { volume = 1, ...options }: Types.Sound.SoundConfig = {},
) => ({
  play: () => {
    scene.sound.play(soundKey, { ...options, volume });
  },
  stop: () => {
    scene.sound.stopByKey(soundKey);
  },
});

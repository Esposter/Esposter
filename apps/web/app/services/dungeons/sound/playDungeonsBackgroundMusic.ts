import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import type { SceneWithPlugins } from "vue-phaserjs";

import { getDungeonsSound } from "#src/services/dungeons/sound/getDungeonsSound";

let backgroundMusicKey: DungeonsKey | undefined;

export const playDungeonsBackgroundMusic = (scene: SceneWithPlugins, key: DungeonsKey) => {
  if (key === backgroundMusicKey) return;

  const allPlayingSounds = scene.sound.getAllPlaying();
  if (backgroundMusicKey) scene.sound.stopByKey(backgroundMusicKey);
  if (allPlayingSounds.some((sound) => sound.key === key)) return;

  backgroundMusicKey = key;
  const { play } = getDungeonsSound(scene, backgroundMusicKey, { loop: true });
  play();
};

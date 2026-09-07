import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { SceneWithPlugins } from "vue-phaserjs";

import { getDungeonsSound } from "@/services/dungeons/sound/getDungeonsSound";

let backgroundMusicKey: FileKey | undefined;

export const playDungeonsBackgroundMusic = (scene: SceneWithPlugins, key: FileKey) => {
  if (key === backgroundMusicKey) return;

  const allPlayingSounds = scene.sound.getAllPlaying();
  if (backgroundMusicKey) scene.sound.stopByKey(backgroundMusicKey);
  if (allPlayingSounds.some((sound) => sound.key === key)) return;

  backgroundMusicKey = key;
  const { play } = getDungeonsSound(scene, backgroundMusicKey, { loop: true });
  play();
};

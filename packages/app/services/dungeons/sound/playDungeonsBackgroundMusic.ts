import type { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import type { SceneWithPlugins } from "vue-phaser";

import { getDungeonsSound } from "@/services/dungeons/sound/getDungeonsSound";

let backgroundMusicKey: BackgroundMusicKey | null = null;

export const playDungeonsBackgroundMusic = (scene: SceneWithPlugins, key: BackgroundMusicKey) => {
  if (key === backgroundMusicKey) return;

  const allPlayingSounds = scene.sound.getAllPlaying();
  if (backgroundMusicKey) scene.sound.stopByKey(backgroundMusicKey);
  if (allPlayingSounds.some((s) => s.key === key)) return;

  backgroundMusicKey = key;
  const { play } = getDungeonsSound(scene, backgroundMusicKey, { loop: true });
  play();
};

import type { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { getDungeonsSound } from "@/services/dungeons/sound/getDungeonsSound";

let backgroundMusicKey: BackgroundMusicKey | null = null;

export const playDungeonsBackgroundMusic = (scene: SceneWithPlugins, key: BackgroundMusicKey) => {
  if (key === backgroundMusicKey) return;

  const allPlayingSounds = scene.sound.getAllPlaying();
  if (backgroundMusicKey) scene.sound.stopByKey(backgroundMusicKey);
  if (!key || allPlayingSounds.some((s) => s.key === key)) return;

  const { play } = getDungeonsSound(scene, key, { loop: true });
  play();
  backgroundMusicKey = key;
};
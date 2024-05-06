import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { BackgroundMusicKey } from "@/models/dungeons/keys/sound/BackgroundMusicKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

let backgroundMusicKey: BackgroundMusicKey | null = null;

export const useDungeonsBackgroundMusic = (scene: SceneWithPlugins, key: BackgroundMusicKey) => {
  const allPlayingSounds = scene.sound.getAllPlaying();
  if (backgroundMusicKey) scene.sound.stopByKey(backgroundMusicKey);
  if (!key || allPlayingSounds.some((s) => s.key === key)) return;

  const { play } = useDungeonsSound(scene, key, { loop: true });
  play();
  backgroundMusicKey = key;

  onShutdown(() => {
    if (backgroundMusicKey) scene.sound.stopByKey(backgroundMusicKey);
    backgroundMusicKey = null;
  }, scene.scene.key);
};

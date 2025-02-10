import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { SceneWithPlugins } from "vue-phaserjs";

import { getDungeonsSound } from "@/services/dungeons/sound/getDungeonsSound";

let fileKey: FileKey | undefined;

export const playDungeonsBackgroundMusic = (scene: SceneWithPlugins, key: FileKey) => {
  if (key === fileKey) return;

  const allPlayingSounds = scene.sound.getAllPlaying();
  if (fileKey) scene.sound.stopByKey(fileKey);
  if (allPlayingSounds.some((s) => s.key === key)) return;

  fileKey = key;
  const { play } = getDungeonsSound(scene, fileKey, { loop: true });
  play();
};

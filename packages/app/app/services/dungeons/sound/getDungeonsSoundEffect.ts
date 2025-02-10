import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { Types } from "phaser";
import type { Except } from "type-fest";
import type { SceneWithPlugins } from "vue-phaserjs";

import { getDungeonsSound } from "@/services/dungeons/sound/getDungeonsSound";

export const getDungeonsSoundEffect = (
  scene: SceneWithPlugins,
  fileKey: FileKey,
  options?: Except<Types.Sound.SoundConfig, "volume">,
) => getDungeonsSound(scene, fileKey, { ...options, volume: 5 });

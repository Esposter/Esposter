import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import type { Types } from "phaser";
import type { Except } from "type-fest";
import type { SceneWithPlugins } from "vue-phaserjs";

import { getDungeonsSound } from "#src/services/dungeons/sound/getDungeonsSound";

export const getDungeonsSoundEffect = (
  scene: SceneWithPlugins,
  fileKey: DungeonsKey,
  options?: Except<Types.Sound.SoundConfig, "volume">,
) => getDungeonsSound(scene, fileKey, { ...options, volume: 5 });

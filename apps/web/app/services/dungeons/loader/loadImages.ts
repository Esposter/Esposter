import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import type { SceneWithPlugins } from "vue-phaserjs";

import { getDungeonsUrl } from "#src/services/dungeons/loader/getDungeonsUrl";

// A texture is drawn under its key, which is the lock key, and its bytes come from the hosted url the key names
export const loadImages = (scene: SceneWithPlugins, origin: string, keys: DungeonsKey[]) => {
  for (const key of keys) scene.load.image(key, getDungeonsUrl(origin, key));
};

import type { SceneWithPlugins } from "vue-phaserjs";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { getDungeonsUrl } from "#src/services/dungeons/loader/getDungeonsUrl";
import { ImageFileKeys } from "#src/services/dungeons/loader/ImageFileKeys";
import { loadImages } from "#src/services/dungeons/loader/loadImages";
import { loadSounds } from "#src/services/dungeons/loader/loadSounds";
import { loadSpritesheets } from "#src/services/dungeons/loader/loadSpritesheets";
import { loadTilemaps } from "#src/services/dungeons/loader/loadTilemaps";
import { loadTilesets } from "#src/services/dungeons/loader/loadTilesets";
import { SoundFileKeys } from "#src/services/dungeons/loader/SoundFileKeys";

// Every file the game draws or plays, each by its hosted url. The loader's crossOrigin is anonymous before the first
// File Because the hosted origin is another one, and a texture WebGL reads needs the CORS response
export const loadDungeonsFiles = (scene: SceneWithPlugins, origin: string) => {
  scene.load.setCORS("anonymous");
  const fontKey = DungeonsKeys.ThirdPartyKenneysAssetsFontsKenneyFutureNarrow;
  scene.load.font(fontKey, getDungeonsUrl(origin, fontKey));
  loadSounds(scene, origin, SoundFileKeys);
  loadSpritesheets(scene, origin);
  loadImages(scene, origin, ImageFileKeys);
  loadTilesets(scene, origin);
  loadTilemaps(scene, origin);
};

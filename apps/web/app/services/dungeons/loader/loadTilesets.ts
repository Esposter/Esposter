import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import type { SceneWithPlugins } from "vue-phaserjs";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { TilesetKey } from "#src/models/dungeons/keys/TilesetKey";
import { getDungeonsUrl } from "#src/services/dungeons/loader/getDungeonsUrl";

interface TilesetConfiguration {
  fileKey: DungeonsKey;
  frame?: { frameHeight: number; frameWidth: number };
}

// Each tileset's image under the tileset's own key, which a Tiled map names it by. The dungeon and interior sheets are
// Cut into frames, so they load as spritesheets of that frame size
const TILESET_CONFIGURATIONS = {
  [TilesetKey.BasicPlains]: { fileKey: DungeonsKeys.TilesetsAxulartBasicPlains },
  [TilesetKey.BeachAndCaves]: { fileKey: DungeonsKeys.TilesetsAxulartBeachAndCaves },
  [TilesetKey.Bushes]: { fileKey: DungeonsKeys.TilesetsFirstPartyBushes },
  [TilesetKey.Collision]: { fileKey: DungeonsKeys.TilesetsFirstPartyCollision },
  [TilesetKey.Dungeon]: { fileKey: DungeonsKeys.TilesetsFirstPartyDungeon, frame: { frameHeight: 16, frameWidth: 16 } },
  [TilesetKey.Encounter]: { fileKey: DungeonsKeys.TilesetsFirstPartyEncounter },
  [TilesetKey.Entrance]: { fileKey: DungeonsKeys.TilesetsFirstPartyEntrance },
  [TilesetKey.Grass]: { fileKey: DungeonsKeys.TilesetsFirstPartyGrass },
  [TilesetKey.House]: { fileKey: DungeonsKeys.TilesetsAxulartHouse },
  [TilesetKey.HouseInterior]: {
    fileKey: DungeonsKeys.TilesetsAxulartHouseInterior,
    frame: { frameHeight: 64, frameWidth: 64 },
  },
  [TilesetKey.Teleport]: { fileKey: DungeonsKeys.TilesetsFirstPartyTeleport },
} as const satisfies Record<TilesetKey, TilesetConfiguration>;

export const loadTilesets = (scene: SceneWithPlugins, origin: string) => {
  for (const [key, { fileKey, frame }] of Object.entries<TilesetConfiguration>(TILESET_CONFIGURATIONS)) {
    const url = getDungeonsUrl(origin, fileKey);
    if (frame) scene.load.spritesheet(key, url, frame);
    else scene.load.image(key, url);
  }
};

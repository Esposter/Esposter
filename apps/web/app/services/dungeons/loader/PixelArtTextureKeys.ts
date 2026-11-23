import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";
import { TilesetKey } from "#src/models/dungeons/keys/TilesetKey";
import { TilemapForegroundFileKeyMap } from "#src/services/dungeons/scene/world/TilemapForegroundFileKeyMap";

// The textures drawn on a pixel grid: every tileset and spritesheet, the
// World's foregrounds cut from those tilesets, and two images. The monsters, the painted backgrounds and Kenney's UI
// Are not pixel art and keep linear filtering
export const PixelArtTextureKeys = [
  ...Object.values(TilesetKey),
  ...Object.values(SpritesheetKey),
  ...Object.values(TilemapForegroundFileKeyMap),
  DungeonsKeys.UIBallsCosmoBall,
  DungeonsKeys.SceneMonsterPartyBackground,
];

import { FileKey } from "#shared/generated/phaser/FileKey";
import { WorldAssetMap } from "#src/services/dungeons/loader/image/WorldAssetMap";
import { SpritesheetAssetMap } from "#src/services/dungeons/loader/spritesheet/SpritesheetAssetMap";
import { TilesetAssetMap } from "#src/services/dungeons/loader/TilesetAssetMap";

// The textures drawn on a pixel grid: every tileset and spritesheet, the
// World's foregrounds cut from those tilesets, and two images. The monsters, the painted backgrounds and Kenney's UI
// Are not pixel art and keep linear filtering
export const PixelArtTextureKeys = [
  ...Object.keys(TilesetAssetMap),
  ...Object.keys(SpritesheetAssetMap),
  ...Object.keys(WorldAssetMap),
  FileKey.UIBallsCosmoBall,
  FileKey.SceneMonsterPartyBackground,
];

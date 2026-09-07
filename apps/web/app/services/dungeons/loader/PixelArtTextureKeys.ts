import { FileKey } from "#shared/generated/phaser/FileKey";
import { SpritesheetLoaderMap } from "@/services/dungeons/loader/spritesheet/SpritesheetLoaderMap";
import { TilesetLoaderMap } from "@/services/dungeons/loader/TilesetLoaderMap";
import { TilemapForegroundFileKeyMap } from "@/services/dungeons/scene/world/TilemapForegroundFileKeyMap";

// The textures drawn on a pixel grid: every tileset and spritesheet, the
// World's foregrounds cut from those tilesets, and two images. The monsters, the painted backgrounds and Kenney's UI
// Are not pixel art and keep linear filtering
export const PixelArtTextureKeys = [
  ...Object.keys(TilesetLoaderMap),
  ...Object.keys(SpritesheetLoaderMap),
  ...Object.values(TilemapForegroundFileKeyMap),
  FileKey.UIBallsCosmoBall,
  FileKey.SceneMonsterPartyBackground,
];

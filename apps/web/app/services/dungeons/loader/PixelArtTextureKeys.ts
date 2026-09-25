import { BallKey } from "#shared/models/dungeons/keys/image/UI/BallKey";
import { MonsterPartyKey } from "#shared/models/dungeons/keys/image/MonsterPartyKey";
import { WorldLoaderMap } from "@/services/dungeons/loader/image/WorldLoaderMap";
import { SpritesheetLoaderMap } from "@/services/dungeons/loader/spritesheet/SpritesheetLoaderMap";
import { TilesetLoaderMap } from "@/services/dungeons/loader/TilesetLoaderMap";
// The textures drawn on a pixel grid, each checked by eye at a scale above one: every tileset and spritesheet, the
// World's foregrounds cut from those tilesets, and two images. The monsters, the painted backgrounds and Kenney's UI
// Are not pixel art and keep linear filtering
export const PixelArtTextureKeys = [
  ...Object.keys(TilesetLoaderMap),
  ...Object.keys(SpritesheetLoaderMap),
  ...Object.keys(WorldLoaderMap),
  BallKey.CosmoBall,
  MonsterPartyKey.MonsterPartyBackground,
];

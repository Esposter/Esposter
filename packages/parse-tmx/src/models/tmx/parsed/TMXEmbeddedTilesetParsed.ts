import type { TMXImageParsed } from "@/src/models/tmx/parsed/TMXImageParsed";
import type { TMXTileParsed } from "@/src/models/tmx/parsed/TMXTileParsed";
import type { TMXEmbeddedTilesetShared } from "@/src/models/tmx/shared/TMXEmbeddedTilesetShared";

export interface TMXEmbeddedTilesetParsed extends TMXEmbeddedTilesetShared {
  image: TMXImageParsed;
  tiles: TMXTileParsed[];
}

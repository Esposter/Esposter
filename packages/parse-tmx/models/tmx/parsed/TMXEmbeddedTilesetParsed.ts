import type { TMXImageParsed } from "parse-tmx/models/tmx/parsed/TMXImageParsed";
import type { TMXTileParsed } from "parse-tmx/models/tmx/parsed/TMXTileParsed";
import type { TMXEmbeddedTilesetShared } from "parse-tmx/models/tmx/shared/TMXEmbeddedTilesetShared";

export interface TMXEmbeddedTilesetParsed extends TMXEmbeddedTilesetShared {
  image: TMXImageParsed;
  tiles: TMXTileParsed[];
}

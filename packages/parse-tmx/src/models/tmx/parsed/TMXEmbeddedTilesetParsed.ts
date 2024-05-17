import type { TMXImageParsed } from "@/models/tmx/parsed/TMXImageParsed";
import type { TMXTileParsed } from "@/models/tmx/parsed/TMXTileParsed";
import type { TMXEmbeddedTilesetShared } from "@/models/tmx/shared/TMXEmbeddedTilesetShared";

export interface TMXEmbeddedTilesetParsed extends TMXEmbeddedTilesetShared {
  image: TMXImageParsed;
  tiles: TMXTileParsed[];
}

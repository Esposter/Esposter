import type { TMXImageParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXImageParsed";
import type { TMXTileParsed } from "@/lib/tmxParser/models/tmx/parsed/TMXTileParsed";
import type { TMXEmbeddedTilesetShared } from "@/lib/tmxParser/models/tmx/shared/TMXEmbeddedTilesetShared";

export interface TMXEmbeddedTilesetParsed extends TMXEmbeddedTilesetShared {
  image: TMXImageParsed;
  tiles: TMXTileParsed[];
}
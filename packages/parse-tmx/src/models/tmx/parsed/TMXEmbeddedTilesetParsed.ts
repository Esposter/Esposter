import type { TMXImageParsed } from "#src/models/tmx/parsed/TMXImageParsed";
import type { TMXTileParsed } from "#src/models/tmx/parsed/TMXTileParsed";
import type { TMXEmbeddedTilesetShared } from "#src/models/tmx/shared/TMXEmbeddedTilesetShared";

// A tileset written as one image has its image; an image collection has none, and its tiles carry their own
export interface TMXEmbeddedTilesetParsed extends TMXEmbeddedTilesetShared {
  image?: TMXImageParsed;
  tiles: TMXTileParsed[];
}

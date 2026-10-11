import type { TMXImageParsed } from "#src/models/tmx/parsed/TMXImageParsed";
import type { TMXTileParsed } from "#src/models/tmx/parsed/TMXTileParsed";

// A tileset written as one image has its image; an image collection has none, and its tiles carry their own
export interface TMXEmbeddedTilesetParsed {
  columns: number;
  firstgid: number;
  image?: TMXImageParsed;
  margin?: number;
  name: string;
  spacing?: number;
  tilecount: number;
  tiles: TMXTileParsed[];
  tileheight: number;
  tilewidth: number;
}

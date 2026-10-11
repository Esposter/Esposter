import type { TMXBaseTilesetShared } from "#src/models/tmx/shared/TMXBaseTilesetShared";

export interface TMXEmbeddedTilesetShared extends TMXBaseTilesetShared {
  columns: number;
  margin?: number;
  name: string;
  spacing?: number;
  tilecount: number;
  tileheight: number;
  tilewidth: number;
}

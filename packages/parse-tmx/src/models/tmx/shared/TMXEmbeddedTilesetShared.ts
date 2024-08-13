import type { TMXBaseTilesetShared } from "@/models/tmx/shared/TMXBaseTilesetShared";

export interface TMXEmbeddedTilesetShared extends TMXBaseTilesetShared {
  columns: number;
  imageheight: number;
  imagewidth: number;
  margin?: number;
  name: string;
  spacing?: number;
  tilecount: number;
  tileheight: number;
  tilewidth: number;
}

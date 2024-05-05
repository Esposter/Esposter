import type { TMXBaseTilesetShared } from "@/lib/tmxParser/models/tmx/shared/TMXBaseTilesetShared";

export interface TMXEmbeddedTilesetShared extends TMXBaseTilesetShared {
  columns: number;
  name: string;
  spacing?: number;
  margin?: number;
  tilecount: number;
  tilewidth: number;
  tileheight: number;
  imagewidth: number;
  imageheight: number;
}

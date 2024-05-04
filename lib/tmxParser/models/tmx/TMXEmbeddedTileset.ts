import type { TMXBaseTileset } from "@/lib/tmxParser/models/tmx/TMXBaseTileset";
import type { TMXImage } from "@/lib/tmxParser/models/tmx/TMXImage";
import type { TMXTile } from "@/lib/tmxParser/models/tmx/TMXTile";

export interface TMXEmbeddedTileset extends TMXBaseTileset {
  columns: number;
  name: string;
  image: TMXImage;
  spacing?: number;
  margin?: number;
  tilecount: number;
  tileheight: number;
  tilewidth: number;
  tiles: TMXTile[];
}

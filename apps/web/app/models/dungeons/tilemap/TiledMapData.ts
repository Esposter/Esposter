import type { Types } from "phaser";
import type { SetRequired } from "type-fest";

// A map's Tiled JSON as Phaser caches it, as far as a read of a door needs it: the tile size and each layer's objects
export interface TiledMapData {
  layers: { name: string; objects?: SetRequired<Types.Tilemaps.TiledObject, "x" | "y">[] }[];
  tileheight: number;
  tilewidth: number;
}

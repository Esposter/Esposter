import type { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

export const TilesetKey = {
  BasicPlains: "BasicPlains",
  BeachAndCaves: "BeachAndCaves",
  House: "House",
  HouseInterior: "HouseInterior",

  Bushes: "Bushes",
  Collision: "Collision",
  Encounter: "Encounter",
  Entrance: "Entrance",
  Grass: "Grass",
} as const satisfies Record<string, string> & {
  // TilesetKey uses the same namespace as ImageKey
  // so we can't have conflicting key names
  [P in ImageKey]?: never;
};
export type TilesetKey = keyof typeof TilesetKey;

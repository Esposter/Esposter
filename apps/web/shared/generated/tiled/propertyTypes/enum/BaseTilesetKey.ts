export const BaseTilesetKey = {
  BasicPlains: "BasicPlains",
  BeachAndCaves: "BeachAndCaves",
  Bushes: "Bushes",
  Collision: "Collision",
  Encounter: "Encounter",
  Entrance: "Entrance",
  Grass: "Grass",
  House: "House",
  HouseInterior: "HouseInterior",
  Teleport: "Teleport",
} as const;
export type BaseTilesetKey = (typeof BaseTilesetKey)[keyof typeof BaseTilesetKey];

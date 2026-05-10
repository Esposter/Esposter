export enum BaseTilesetKey {
  BasicPlains = "BasicPlains",
  BeachAndCaves = "BeachAndCaves",
  Bushes = "Bushes",
  Collision = "Collision",
  Encounter = "Encounter",
  Entrance = "Entrance",
  Grass = "Grass",
  House = "House",
  HouseInterior = "HouseInterior",
  Teleport = "Teleport",
}

export const BaseTilesetKeys: ReadonlySet<BaseTilesetKey> = new Set(Object.values(BaseTilesetKey));

import type { WorldAreaType } from "#src/models/genshinAssets/world/WorldAreaType";
import type { AreaTerrainType } from "genshin-world";

// An area of the game's own table as the community's dump writes one: its level, the level-one area it is or lies in,
// Its id among the scene points, its name's text id, the scene it is in and the kind of ground it is
export interface WorldArea {
  areaID1: number;
  areaID2: number;
  areaNameTextMapHash: number;
  areaType: WorldAreaType;
  sceneID: number;
  terrainType: AreaTerrainType;
}

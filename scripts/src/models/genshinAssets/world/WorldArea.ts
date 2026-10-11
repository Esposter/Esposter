import type { WorldAreaType } from "#src/models/genshinAssets/world/WorldAreaType";

// An area of the game's own table as the community's dump writes one: its level, the level-one area it is or lies in,
// Its id among the scene points, and its name's text id
export interface WorldArea {
  areaID1: number;
  areaID2: number;
  areaNameTextMapHash: number;
  areaType: WorldAreaType;
}

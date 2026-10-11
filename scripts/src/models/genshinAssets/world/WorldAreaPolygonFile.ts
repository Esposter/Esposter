import type { GroundPoint } from "genshin-engine";

// The game's own outlines of a scene's areas as the community's dump writes them (`scene3_worldArea.json`): each
// Level-one area's polygon under its id, with its level-two areas' each under theirs, and every corner in the game's x
// And z. A level-one area with no level-two area carries none
export interface WorldAreaPolygonFile {
  level1Areas: {
    level1Area: { id1: number; polygonData: { roadPoints: GroundPoint[] } };
    level2Areas?: { id1: number; id2: number; polygonData: { roadPoints: GroundPoint[] } }[];
  }[];
}

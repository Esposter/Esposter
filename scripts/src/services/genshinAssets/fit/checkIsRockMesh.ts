import { createMeshFamilyCheck } from "#src/services/genshinAssets/fit/createMeshFamilyCheck";

// A rock object's mesh, of the families `Area_<code>_Rock_` and `Area_<code>_Stone_`: a rock or a boulder.
// What the families also name and is not a rock: the wall and road of a built area, and a lamp in a stone's shape
export const checkIsRockMesh = createMeshFamilyCheck(
  /^Area_[A-Za-z]+_(?:Rock|Stone)_/u,
  /RockWall|RockRoad|Stonelamp/u,
);

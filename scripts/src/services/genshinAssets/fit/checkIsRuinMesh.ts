import { createMeshFamilyCheck } from "#src/services/genshinAssets/fit/createMeshFamilyCheck";

// A ruin object's mesh, of the families `Area_Common_Build_Ruin_` and `Area_Common_Build_Pillar_`: a ruin's walls, floors
// And columns, and the pillars the game stands among them
export const checkIsRuinMesh = createMeshFamilyCheck(/^Area_Common_Build_(?:Ruin|Pillar)_/u);

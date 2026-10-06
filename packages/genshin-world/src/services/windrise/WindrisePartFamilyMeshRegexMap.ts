import { WindrisePartFamily } from "#src/models/windrise/WindrisePartFamily";

// The game's meshes each family of Windrise's parts stands in for, by name: its terrain tiles, the oak, the paving
// Slabs round the statue, and the statue's levels
export const WindrisePartFamilyMeshRegexMap: Record<WindrisePartFamily, RegExp> = {
  [WindrisePartFamily.Ground]: /^BigWorldTerrain_/u,
  [WindrisePartFamily.Oak]: /^Stages_Unique_CyTree01_/u,
  [WindrisePartFamily.Paving]: /^Area_Common_Build_Ruin_/u,
  [WindrisePartFamily.Statue]: /^Stages_MdGoddess/u,
};

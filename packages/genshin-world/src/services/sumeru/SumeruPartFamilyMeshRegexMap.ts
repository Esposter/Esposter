import { SumeruPartFamily } from "#src/models/sumeru/SumeruPartFamily";

// The game's meshes each family of Sumeru City's parts stands in for, by name: its terrain tiles, and the city's houses
// And the Akademiya's terraces the kit's buildings stand in for, under Sumeru's code
export const SumeruPartFamilyMeshRegexMap: Record<SumeruPartFamily, RegExp> = {
  [SumeruPartFamily.Buildings]: /^Area_Xm_Build_/u,
  [SumeruPartFamily.Ground]: /^BigWorldTerrain_/u,
};

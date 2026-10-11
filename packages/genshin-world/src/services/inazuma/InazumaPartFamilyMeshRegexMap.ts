import { InazumaPartFamily } from "#src/models/inazuma/InazumaPartFamily";

// The game's meshes each family of Inazuma City's parts stands in for, by name: its terrain tiles, and the city's houses
// And the Tenshukaku the kit's building stands in for, under Inazuma's code
export const InazumaPartFamilyMeshRegexMap: Record<InazumaPartFamily, RegExp> = {
  [InazumaPartFamily.Buildings]: /^Area_Dq_Build_/u,
  [InazumaPartFamily.Ground]: /^BigWorldTerrain_/u,
};

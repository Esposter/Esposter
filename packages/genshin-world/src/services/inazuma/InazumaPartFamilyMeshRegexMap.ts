import { InazumaPartFamily } from "#src/models/inazuma/InazumaPartFamily";

// The game's meshes each Inazuma City part family stands in for, by name: its terrain tiles, and the city's houses.
// The Tenshukaku the kit's building stands in for is named under Inazuma's code.
export const InazumaPartFamilyMeshRegexMap: Record<InazumaPartFamily, RegExp> = {
  [InazumaPartFamily.Buildings]: /^Area_Dq_Build_/u,
  [InazumaPartFamily.Ground]: /^BigWorldTerrain_/u,
};

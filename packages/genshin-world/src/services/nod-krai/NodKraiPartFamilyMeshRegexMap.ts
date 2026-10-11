import { NodKraiPartFamily } from "#src/models/nod-krai/NodKraiPartFamily";

// The game's meshes each family of Nasha Town's parts stands in for, by name: its terrain tiles, and the town's works
// The dieselpunk kit stands in for, under Nod-Krai's code
export const NodKraiPartFamilyMeshRegexMap: Record<NodKraiPartFamily, RegExp> = {
  [NodKraiPartFamily.Buildings]: /^Area_Ndkl_Build_/u,
  [NodKraiPartFamily.Ground]: /^BigWorldTerrain_/u,
};

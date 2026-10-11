import { NatlanPartFamily } from "#src/models/natlan/NatlanPartFamily";

// The game's meshes each family of the People of the Springs' parts stands in for, by name: its terrain tiles, and the
// Tribe's buildings by Natlan's code in the game's mesh names
export const NatlanPartFamilyMeshRegexMap: Record<NatlanPartFamily, RegExp> = {
  [NatlanPartFamily.Buildings]: /^Area_Nt_Build_/u,
  [NatlanPartFamily.Ground]: /^BigWorldTerrain_/u,
};

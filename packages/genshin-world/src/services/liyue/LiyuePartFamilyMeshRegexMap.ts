import { LiyuePartFamily } from "#src/models/liyue/LiyuePartFamily";

// The game's meshes each family of Liyue Harbor's parts stands in for, by name: its terrain tiles, and the harbour's
// Buildings by Liyue's code in the game's mesh names, which spells it `Ly` and `LY` both
export const LiyuePartFamilyMeshRegexMap: Record<LiyuePartFamily, RegExp> = {
  [LiyuePartFamily.Buildings]: /^Area_(?:LY|Ly)_Build_/u,
  [LiyuePartFamily.Ground]: /^BigWorldTerrain_/u,
};

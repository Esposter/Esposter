import { MondstadtPartFamily } from "#src/models/mondstadt/MondstadtPartFamily";

// The game's meshes each family of Mondstadt City's parts stands in for, by name: its terrain tiles, and the city's
// Buildings by Mondstadt's code in the game's mesh names, which spells it `MdBuild` and `Mdbuild` both
export const MondstadtPartFamilyMeshRegexMap: Record<MondstadtPartFamily, RegExp> = {
  [MondstadtPartFamily.Buildings]: /^Area_Md[Bb]uild_/u,
  [MondstadtPartFamily.Ground]: /^BigWorldTerrain_/u,
};

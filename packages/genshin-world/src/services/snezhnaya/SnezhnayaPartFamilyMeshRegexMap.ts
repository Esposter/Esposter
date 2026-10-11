import { SnezhnayaPartFamily } from "#src/models/snezhnaya/SnezhnayaPartFamily";

// The game's meshes each family of Everfrozen Earth's parts stands in for, by name: its terrain tiles
export const SnezhnayaPartFamilyMeshRegexMap: Record<SnezhnayaPartFamily, RegExp> = {
  [SnezhnayaPartFamily.Ground]: /^BigWorldTerrain_/u,
};

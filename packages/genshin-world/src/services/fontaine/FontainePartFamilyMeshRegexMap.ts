import { FontainePartFamily } from "#src/models/fontaine/FontainePartFamily";

// The game's meshes each family of the Court of Fontaine's parts stands in for, by name: its terrain tiles, and the
// Court's houses and towers the kit's buildings stand in for, under Fontaine's code
export const FontainePartFamilyMeshRegexMap: Record<FontainePartFamily, RegExp> = {
  [FontainePartFamily.Buildings]: /^Area_Fd_Build_/u,
  [FontainePartFamily.Ground]: /^BigWorldTerrain_/u,
};

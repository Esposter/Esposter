// A ruin object's mesh, of the families `Area_Common_Build_Ruin_` and `Area_Common_Build_Pillar_`: a ruin's walls, floors
// And columns, and the pillars the game stands among them. Its shadow-casting copy, which the witness lays beside each
// Mesh, is not drawn apart from it
const RUIN_MESH_REGEX = /^Area_Common_Build_(?:Ruin|Pillar)_/u;
const SHADOW_MESH_REGEX = /ShadowMesh/u;

export const checkIsRuinMesh = (mesh: string): boolean => RUIN_MESH_REGEX.test(mesh) && !SHADOW_MESH_REGEX.test(mesh);

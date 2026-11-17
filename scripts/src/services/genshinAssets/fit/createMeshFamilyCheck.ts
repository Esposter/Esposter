// A mesh of the family its pattern names, unless the exclusion names it too. The shadow-casting copy the witness lays
// Beside each mesh is not drawn apart from it, so every family excludes it
const SHADOW_MESH_REGEX = /ShadowMesh/u;

export const createMeshFamilyCheck =
  (family: RegExp, exclusion?: RegExp) =>
  (mesh: string): boolean =>
    family.test(mesh) && !SHADOW_MESH_REGEX.test(mesh) && (exclusion === undefined || !exclusion.test(mesh));

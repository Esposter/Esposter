import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";

// The roots that hold the held weapons' meshes, and each held mesh no root reaches, which the export reports
export interface WeaponRootDerivation<THeldMesh> {
  roots: AssetRoot[];
  unreachedMeshes: THeldMesh[];
}

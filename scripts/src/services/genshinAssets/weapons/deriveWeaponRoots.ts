import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { SceneLayout } from "#src/models/genshinAssets/shared/SceneLayout";
import type { WeaponRootDerivation } from "#src/models/genshinAssets/weapons/WeaponRootDerivation";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { findHierarchyRoot } from "#src/services/genshinAssets/shared/findHierarchyRoot";
import { resolveObjectPointer } from "#src/services/genshinAssets/shared/resolveObjectPointer";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { toBlockPathKey } from "#src/services/genshinAssets/weapons/toBlockPathKey";

// The root game object of each prefab whose renderers draw a held mesh, read from the dumped layouts: a drawing's mesh
// Pointer is resolved through its own file to the block and path ID the asset index names the mesh by, and the object
// Is walked up its parents to the one with none. A root is named by its block, its game object's name and path ID, as
// A component's roots are, and a root whose file the CAB map does not know has no block to be named by, so the meshes
// Under it count as unreached. Each held mesh no root reaches is returned beside them, as it was given
export const deriveWeaponRoots = <THeldMesh extends Pick<IndexedAsset, "block" | "pathId">>(
  { gameObjectDrawingMap, objects }: Pick<SceneLayout, "gameObjectDrawingMap" | "objects">,
  cabMap: ReadonlyMap<string, CabEntry>,
  heldMeshes: readonly THeldMesh[],
): WeaponRootDerivation<THeldMesh> => {
  const heldKeys = new Set(heldMeshes.map((mesh) => toBlockPathKey(mesh)));
  const objectMap = new Map(objects.map((object) => [toObjectKey(object.file, object.transformId), object]));
  const reachedKeys = new Set<string>();
  const rootMap = new Map<string, AssetRoot>();
  for (const object of objects)
    for (const pointer of gameObjectDrawingMap.get(toObjectKey(object.file, object.gameObjectId))?.pointers ?? []) {
      const resolved = resolveObjectPointer(cabMap, object.file, pointer);
      if (!resolved || !heldKeys.has(toBlockPathKey(resolved))) continue;
      const root = findHierarchyRoot(objectMap, object);
      const block = cabMap.get(root.file)?.block;
      if (!block) continue;
      reachedKeys.add(toBlockPathKey(resolved));
      rootMap.set(toBlockPathKey({ block, pathId: root.gameObjectId }), {
        block,
        name: root.name,
        pathId: root.gameObjectId,
      });
    }
  return {
    roots: [...rootMap.values()].toSorted(
      (firstRoot, secondRoot) =>
        firstRoot.block.localeCompare(secondRoot.block) ||
        firstRoot.name.localeCompare(secondRoot.name) ||
        firstRoot.pathId.localeCompare(secondRoot.pathId),
    ),
    unreachedMeshes: heldMeshes.filter((mesh) => !reachedKeys.has(toBlockPathKey(mesh))),
  };
};

import type { AssetRoot } from "#src/models/genshinAssets/shared/AssetRoot";
import type { SceneLayout } from "#src/models/genshinAssets/shared/SceneLayout";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";
import type { WeaponRootDerivation } from "#src/models/genshinAssets/weapons/WeaponRootDerivation";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";
import type { IndexedAsset } from "#src/models/recreation/animeStudio/IndexedAsset";

import { resolveObjectPointer } from "#src/services/genshinAssets/shared/resolveObjectPointer";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";

type HeldMesh = Pick<IndexedAsset, "block" | "pathId">;

const toMeshKey = ({ block, pathId }: HeldMesh): string => `${block}\0${pathId}`;

// The root game object of each prefab whose renderers draw a held mesh, read from the dumped layouts: a drawing's mesh
// Pointer is resolved through its own file to the block and path ID the asset index names the mesh by, and the object
// Is walked up its parents to the one with none. A root is named by its block, its game object's name and path ID, as
// A component's roots are, and a root whose file the CAB map does not know has no block to be named by, so the meshes
// Under it count as unreached. Each held mesh no root reaches is returned beside them, as it was given
export const deriveWeaponRoots = <THeldMesh extends HeldMesh>(
  { gameObjectDrawingMap, objects }: Pick<SceneLayout, "gameObjectDrawingMap" | "objects">,
  cabMap: ReadonlyMap<string, CabEntry>,
  heldMeshes: readonly THeldMesh[],
): WeaponRootDerivation<THeldMesh> => {
  const heldKeys = new Set(heldMeshes.map(toMeshKey));
  const objectMap = new Map(objects.map((object) => [toObjectKey(object.file, object.transformId), object]));
  const findRootOf = (object: SceneObject): SceneObject => {
    let current = object;
    for (let parent = objectMap.get(toObjectKey(current.parentFile, current.parentId)); parent;) {
      current = parent;
      parent = objectMap.get(toObjectKey(current.parentFile, current.parentId));
    }
    return current;
  };
  const reachedKeys = new Set<string>();
  const rootMap = new Map<string, AssetRoot>();
  for (const object of objects)
    for (const pointer of gameObjectDrawingMap.get(toObjectKey(object.file, object.gameObjectId))?.pointers ?? []) {
      const resolved = resolveObjectPointer(cabMap, object.file, pointer);
      if (!resolved || !heldKeys.has(toMeshKey(resolved))) continue;
      const root = findRootOf(object);
      const block = cabMap.get(root.file)?.block;
      if (!block) continue;
      reachedKeys.add(toMeshKey(resolved));
      rootMap.set(`${block}\0${root.gameObjectId}`, { block, name: root.name, pathId: root.gameObjectId });
    }
  return {
    roots: [...rootMap.values()].toSorted(
      (first, second) =>
        first.block.localeCompare(second.block) ||
        first.name.localeCompare(second.name) ||
        first.pathId.localeCompare(second.pathId),
    ),
    unreachedMeshes: heldMeshes.filter((mesh) => !reachedKeys.has(toMeshKey(mesh))),
  };
};

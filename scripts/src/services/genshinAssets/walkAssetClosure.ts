import type { AssetRoot } from "#src/models/genshinAssets/AssetRoot";
import type { CabEntry } from "#src/models/genshinAssets/CabEntry";
import type { ResolvedObject } from "#src/models/genshinAssets/ResolvedObject";
import type { SceneDrawing } from "#src/models/genshinAssets/SceneDrawing";
import type { SceneObject } from "#src/models/genshinAssets/SceneObject";

import { groupSceneChildren } from "#src/services/genshinAssets/groupSceneChildren";
import { resolveObjectPointer } from "#src/services/genshinAssets/resolveObjectPointer";
import { toObjectKey } from "#src/services/genshinAssets/toObjectKey";
import { basename } from "node:path";

// Everything a component's roots reach through the layout dumps, held as file and path ID throughout: each root's
// Objects down its children, and the meshes and materials their renderers draw, each pointer resolved through its own
// File's external references. What cannot be reached is returned beside it: a root no dump holds, a child the dumps
// Lack, and a pointer whose file index or file the CAB map does not know
export const walkAssetClosure = (
  objects: readonly SceneObject[],
  gameObjectDrawingMap: ReadonlyMap<string, SceneDrawing>,
  roots: readonly AssetRoot[],
  cabMap: ReadonlyMap<string, CabEntry>,
): { assets: ResolvedObject[]; objects: SceneObject[]; unresolved: string[] } => {
  const childrenMap = groupSceneChildren(objects);
  const reached: SceneObject[] = [];
  const assetMap = new Map<string, ResolvedObject>();
  const unresolved: string[] = [];
  const reachedKeys = new Set<string>();
  const visit = (object: SceneObject): void => {
    const key = toObjectKey(object.file, object.transformId);
    if (reachedKeys.has(key)) return;
    reachedKeys.add(key);
    reached.push(object);
    for (const pointer of gameObjectDrawingMap.get(toObjectKey(object.file, object.gameObjectId))?.pointers ?? []) {
      const resolved = resolveObjectPointer(cabMap, object.file, pointer);
      if (resolved) assetMap.set(toObjectKey(resolved.file, resolved.pathId), resolved);
      else unresolved.push(`${object.name}: file ${pointer.fileIndex} of ${object.file}, path ID ${pointer.pathId}`);
    }
    const children = childrenMap.get(toObjectKey(object.file, object.transformId)) ?? [];
    if (children.length < object.childIds.length)
      unresolved.push(
        `${object.name}: ${object.childIds.length - children.length} of its children in ${object.file} not dumped`,
      );
    for (const child of children) visit(child);
  };
  for (const root of roots) {
    // A layout folder is named after its block without its folder or extension
    const blockName = basename(root.block, ".blk");
    const object = objects.find(({ block, gameObjectId }) => block === blockName && gameObjectId === root.pathId);
    if (object) visit(object);
    else unresolved.push(`${root.name}: game object ${root.pathId} in ${root.block}`);
  }
  return { assets: [...assetMap.values()], objects: reached, unresolved };
};

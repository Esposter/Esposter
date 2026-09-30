import type { SceneDrawing } from "#src/models/genshinAssets/SceneDrawing";
import type { SceneObject } from "#src/models/genshinAssets/SceneObject";
import type { SceneTreeNode } from "#src/models/genshinAssets/SceneTreeNode";

import { SceneTreeFlag } from "#src/models/genshinAssets/SceneTreeFlag";
import { composeWorldMatrices } from "#src/services/genshinAssets/composeWorldMatrices";
import { ROOT_PARENT_ID } from "#src/services/genshinAssets/constants";
import { groupSceneChildren } from "#src/services/genshinAssets/groupSceneChildren";
import { toObjectKey } from "#src/services/genshinAssets/toObjectKey";
import { Quaternion, Vector3 } from "three";

// A scene's hierarchy as the dumps hold it, from every root and every object whose father no dump holds, each node
// Flagged with what its arrangement turns on: an empty anchor a script spawns into, a lost father or lost children, a
// Root at the origin, and a mesh laid out under several of these tops
export const composeSceneTree = (
  objects: readonly SceneObject[],
  gameObjectDrawingMap: ReadonlyMap<string, SceneDrawing>,
): SceneTreeNode[] => {
  const idObjectMap = new Map(objects.map((object) => [object.transformId, object]));
  const childrenMap = groupSceneChildren(objects);
  const idWorldMatrixMap = composeWorldMatrices(objects);
  const meshTopsMap = new Map<string, Set<string>>();
  const toNode = (object: SceneObject, top: SceneObject, visitedIds: ReadonlySet<string>): SceneTreeNode => {
    const mesh = gameObjectDrawingMap.get(toObjectKey(object.file, object.gameObjectId))?.mesh ?? "";
    if (mesh) meshTopsMap.set(mesh, (meshTopsMap.get(mesh) ?? new Set()).add(top.transformId));
    const nextVisitedIds = new Set([...visitedIds, object.transformId]);
    const children = (childrenMap.get(toObjectKey(object.file, object.transformId)) ?? [])
      .filter(({ transformId }) => !nextVisitedIds.has(transformId))
      .map((child) => toNode(child, top, nextVisitedIds));
    const flags: SceneTreeFlag[] = [];
    const isRoot = object.parentId === ROOT_PARENT_ID;
    if (object.childIds.length === 0 && !mesh && object.components.length === 0) flags.push(SceneTreeFlag.EmptyAnchor);
    if (children.length < object.childIds.length) flags.push(SceneTreeFlag.LostChildren);
    if (!isRoot && !idObjectMap.has(object.parentId)) flags.push(SceneTreeFlag.LostFather);
    if (
      isRoot &&
      object.position.every((value) => value === 0) &&
      new Quaternion(...object.rotation).equals(new Quaternion())
    )
      flags.push(SceneTreeFlag.RootAtOrigin);
    const worldScale = new Vector3();
    idWorldMatrixMap.get(object.transformId)?.decompose(new Vector3(), new Quaternion(), worldScale);
    return { children, flags, mesh, object, worldScale: worldScale.toArray() };
  };
  const tops = objects
    .filter(({ parentId }) => parentId === ROOT_PARENT_ID || !idObjectMap.has(parentId))
    .map((top) => toNode(top, top, new Set()));
  const flagSharedMeshes = (node: SceneTreeNode): void => {
    if ((meshTopsMap.get(node.mesh)?.size ?? 0) > 1) node.flags.push(SceneTreeFlag.SharedMesh);
    for (const child of node.children) flagSharedMeshes(child);
  };
  for (const top of tops) flagSharedMeshes(top);
  return tops;
};

import type { SceneTreeNode } from "#src/models/genshinAssets/scene/SceneTreeNode";
import type { SceneDrawing } from "#src/models/genshinAssets/shared/SceneDrawing";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { SceneTreeFlag } from "#src/models/genshinAssets/scene/SceneTreeFlag";
import { composeWorldMatrices } from "#src/services/genshinAssets/shared/composeWorldMatrices";
import { ROOT_PARENT_ID } from "#src/services/genshinAssets/shared/constants";
import { groupSceneChildren } from "#src/services/genshinAssets/shared/groupSceneChildren";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { getOrCreate } from "@esposter/shared";
import { Quaternion, Vector3 } from "three";

// A scene's hierarchy as the dumps hold it, from every root and every object whose father no dump holds, each node
// Flagged with what its arrangement turns on: an empty anchor a script spawns into, a lost father or lost children, a
// Root at the origin, and a mesh laid out under several of these tops
export const composeSceneTree = (
  objects: readonly SceneObject[],
  gameObjectDrawingMap: ReadonlyMap<string, SceneDrawing>,
): SceneTreeNode[] => {
  const keyObjectMap = new Map(objects.map((object) => [toObjectKey(object.file, object.transformId), object]));
  const checkHasFather = ({ parentFile, parentId }: SceneObject): boolean =>
    keyObjectMap.has(toObjectKey(parentFile, parentId));
  const parentKeyChildrenMap = groupSceneChildren(objects);
  const keyWorldMatrixMap = composeWorldMatrices(objects);
  const meshTopsMap = new Map<string, Set<string>>();
  const toNode = (object: SceneObject, top: SceneObject, visitedKeys: ReadonlySet<string>): SceneTreeNode => {
    const key = toObjectKey(object.file, object.transformId);
    const mesh = gameObjectDrawingMap.get(toObjectKey(object.file, object.gameObjectId))?.mesh ?? "";
    if (mesh) getOrCreate(meshTopsMap, mesh, () => new Set()).add(toObjectKey(top.file, top.transformId));
    const nextVisitedKeys = new Set([...visitedKeys, key]);
    const children = (parentKeyChildrenMap.get(key) ?? [])
      .filter(({ file, transformId }) => !nextVisitedKeys.has(toObjectKey(file, transformId)))
      .map((child) => toNode(child, top, nextVisitedKeys));
    const flags: SceneTreeFlag[] = [];
    const isRoot = object.parentId === ROOT_PARENT_ID;
    if (object.childIds.length === 0 && !mesh && object.components.length === 0) flags.push(SceneTreeFlag.EmptyAnchor);
    if (children.length < object.childIds.length) flags.push(SceneTreeFlag.LostChildren);
    if (!isRoot && !checkHasFather(object)) flags.push(SceneTreeFlag.LostFather);
    if (
      isRoot &&
      object.position.every((value) => value === 0) &&
      new Quaternion(...object.rotation).equals(new Quaternion())
    )
      flags.push(SceneTreeFlag.RootAtOrigin);
    const worldScale = new Vector3();
    keyWorldMatrixMap.get(key)?.decompose(new Vector3(), new Quaternion(), worldScale);
    return { children, flags, mesh, object, worldScale: worldScale.toArray() };
  };
  const tops = objects
    .filter((object) => object.parentId === ROOT_PARENT_ID || !checkHasFather(object))
    .map((top) => toNode(top, top, new Set()));
  const flagSharedMeshes = (node: SceneTreeNode): void => {
    if ((meshTopsMap.get(node.mesh)?.size ?? 0) > 1) node.flags.push(SceneTreeFlag.SharedMesh);
    for (const child of node.children) flagSharedMeshes(child);
  };
  for (const top of tops) flagSharedMeshes(top);
  return tops;
};

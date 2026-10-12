import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";
import type { SkinnedRenderer } from "#src/services/genshinAssets/avatar/readRendererBones";

import { getTransformKey } from "#src/services/genshinAssets/avatar/readRendererBones";

// A skinned renderer with the name its mesh has in the asset index, and the scene object its game object is
export interface RosterRenderer extends SkinnedRenderer {
  name: string;
  object?: SceneObject;
}

// A mesh's name with its level of detail, such as "Body_LOD1", which the avatar's LOD0 meshes do not carry
const LOD_SUFFIX_REGEX = /_LOD\d+$/u;

// Whether an object lies under the root in the tree, the root itself included, by walking its parents up to the root
const checkInTree = (object: SceneObject, rootKey: string, objectMap: ReadonlyMap<string, SceneObject>): boolean => {
  let current: SceneObject | undefined = object;
  while (current) {
    if (getTransformKey(current.file, current.transformId) === rootKey) return true;
    current = objectMap.get(getTransformKey(current.parentFile || current.file, current.parentId));
  }
  return false;
};

// The meshes a model draws: the LOD0 renderers under its root, in name order. A renderer whose own dump switches it off is
// Left out; a dump that says nothing of the switch leaves the renderer on, as Unity's default does
export const readAvatarRoster = (
  renderers: readonly RosterRenderer[],
  rootKey: string,
  objectMap: ReadonlyMap<string, SceneObject>,
): RosterRenderer[] =>
  renderers
    .filter(
      ({ name, object, renderer }) =>
        renderer.m_Enabled !== 0 &&
        !LOD_SUFFIX_REGEX.test(name) &&
        object !== undefined &&
        checkInTree(object, rootKey, objectMap),
    )
    .toSorted((firstRenderer, secondRenderer) => firstRenderer.name.localeCompare(secondRenderer.name));

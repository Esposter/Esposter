import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";
import type { SkinnedRenderer } from "#src/services/genshinAssets/avatar/readRendererBones";

import { getTransformKey } from "#src/services/genshinAssets/avatar/readRendererBones";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";

// A skinned renderer whose mesh resolves, with the name the asset index gives that mesh and the scene object its game
// Object is
export interface RosterRenderer extends SkinnedRenderer {
  mesh: ResolvedObject;
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
// Left out; a dump that says nothing of the switch leaves the renderer on, as Unity's default does. A renderer is also left
// Out when any material it lists has no main texture: such a material is the effect system's shell, and an effect fills it.
// The textured materials are keyed by file and path ID, as the renderers' materials resolve
export const readAvatarRoster = (
  renderers: readonly RosterRenderer[],
  rootKey: string,
  objectMap: ReadonlyMap<string, SceneObject>,
  texturedMaterials: ReadonlySet<string>,
): RosterRenderer[] =>
  renderers
    .filter(
      ({ materials, name, object, renderer }) =>
        renderer.m_Enabled !== 0 &&
        !LOD_SUFFIX_REGEX.test(name) &&
        object !== undefined &&
        checkInTree(object, rootKey, objectMap) &&
        materials.every(
          (material) => material !== undefined && texturedMaterials.has(toObjectKey(material.file, material.pathId)),
        ),
    )
    .toSorted((firstRenderer, secondRenderer) => firstRenderer.name.localeCompare(secondRenderer.name));

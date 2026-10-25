import type { RosterRenderer } from "#src/models/genshinAssets/avatar/RosterRenderer";
import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";

import { checkInTree } from "#src/services/genshinAssets/avatar/checkInTree";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";

// A mesh's name with its level of detail, such as "Body_LOD1", which the avatar's LOD0 meshes do not carry
const LOD_SUFFIX_REGEX = /_LOD\d+$/u;

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

import type { SceneObject } from "#src/models/genshinAssets/shared/SceneObject";
import type { AvatarBone } from "genshin-world/sceneExport";

import { mirrorAvatarPoint } from "#src/services/genshinAssets/avatar/mirrorAvatarPoint";
import { mirrorAvatarRotation } from "#src/services/genshinAssets/avatar/mirrorAvatarRotation";

export const addedNode = (object: SceneObject, parent: number, name: string): AvatarBone => ({
  name,
  parent,
  position: mirrorAvatarPoint(object.position),
  rotation: mirrorAvatarRotation(object.rotation),
  scale: object.scale,
});

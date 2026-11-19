import type { SceneContext } from "#src/models/scene/SceneContext";
import type { SceneSurfaceDetail } from "#src/models/scene/SceneSurfaceDetail";
import type { SurfaceDetail } from "genshin-engine";

import { SURFACE_DETAIL_KEY } from "#src/services/scene/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { Mesh } from "three";

// The surface detail a family's grain is drawn with as the scene was built, which a grain fit starts from
export const getSceneSurfaceDetail = (context: SceneContext | undefined, family: string): SurfaceDetail => {
  if (!context) throw new InvalidOperationError(Operation.Read, "scene", "the scene has not rendered yet");
  let found: SurfaceDetail | undefined;
  context.scene.traverse((object) => {
    if (found || !(object instanceof Mesh) || Array.isArray(object.material)) return;
    const tag: SceneSurfaceDetail | undefined = object.material.userData[SURFACE_DETAIL_KEY];
    if (tag?.family === family) found = tag.detail;
  });
  if (!found)
    throw new InvalidOperationError(Operation.Read, family, "no material of the scene draws its surface detail");
  return found;
};

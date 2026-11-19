import type { SceneContext } from "#src/models/scene/SceneContext";
import type { SceneSurfaceDetail } from "#src/models/scene/SceneSurfaceDetail";

import { SURFACE_DETAIL_KEY } from "#src/services/scene/constants";
import { Mesh } from "three";

// The surface detail tags of the materials that draw one family's grain, as the scene was built, in the scene's order
export const findSceneSurfaceDetails = (context: SceneContext, family: string): SceneSurfaceDetail[] => {
  const details: SceneSurfaceDetail[] = [];
  context.scene.traverse((object) => {
    if (!(object instanceof Mesh) || Array.isArray(object.material)) return;
    const detail: SceneSurfaceDetail | undefined = object.material.userData[SURFACE_DETAIL_KEY];
    if (detail?.family === family) details.push(detail);
  });
  return details;
};

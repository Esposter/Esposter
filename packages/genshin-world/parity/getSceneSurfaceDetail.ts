import type { SceneContext } from "#src/models/scene/SceneContext";
import type { SurfaceDetail } from "genshin-engine";

import { findSceneSurfaceDetails } from "#parity/findSceneSurfaceDetails";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The surface detail a family's grain is drawn with as the scene was built, which a grain fit starts from
export const getSceneSurfaceDetail = (context: SceneContext | undefined, family: string): SurfaceDetail => {
  if (!context) throw new InvalidOperationError(Operation.Read, "scene", "the scene has not rendered yet");
  const [found] = findSceneSurfaceDetails(context, family);
  if (!found)
    throw new InvalidOperationError(Operation.Read, family, "no material of the scene draws its surface detail");
  return found.detail;
};

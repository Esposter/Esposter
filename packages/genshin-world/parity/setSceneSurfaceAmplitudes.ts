import type { SceneContext } from "#src/models/scene/SceneContext";
import type { SceneSurfaceDetail } from "#src/models/scene/SceneSurfaceDetail";

import { SURFACE_DETAIL_KEY } from "#src/services/scene/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { Mesh } from "three";

// The amplitudes of one family's grain, set on the live materials that draw that family, one per octave in the order
// `computeSurfaceOctaves` gives them. A tool solves a family's grain by setting each candidate and reading the frame the
// Scene draws, without rebuilding the scene for it. A family no material draws is an error, since its grain is then unset
export const setSceneSurfaceAmplitudes = (
  context: SceneContext | undefined,
  family: string,
  amplitudes: readonly number[],
): void => {
  if (!context) throw new InvalidOperationError(Operation.Read, "scene", "the scene has not rendered yet");
  let isSet = false;
  context.scene.traverse((object) => {
    if (!(object instanceof Mesh) || Array.isArray(object.material)) return;
    const detail: SceneSurfaceDetail | undefined = object.material.userData[SURFACE_DETAIL_KEY];
    if (detail?.family !== family) return;
    for (const [octave, uniform] of detail.amplitudes.entries()) uniform.value = amplitudes[octave] ?? 0;
    isSet = true;
  });
  if (!isSet)
    throw new InvalidOperationError(Operation.Update, family, "no material of the scene draws its surface detail");
};

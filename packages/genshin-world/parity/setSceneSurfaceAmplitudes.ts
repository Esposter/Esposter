import type { SceneContext } from "#src/models/scene/SceneContext";

import { findSceneSurfaceDetails } from "#parity/findSceneSurfaceDetails";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The amplitudes of one family's grain, set on the live materials that draw that family, one per octave in the order
// `computeSurfaceOctaves` gives them. A tool solves a family's grain by setting each candidate and reading the frame the
// Scene draws, without rebuilding the scene for it. A family no material draws is an error, since its grain is then unset
export const setSceneSurfaceAmplitudes = (
  context: SceneContext | undefined,
  family: string,
  amplitudes: readonly number[],
): void => {
  if (!context) throw new InvalidOperationError(Operation.Read, "scene", "the scene has not rendered yet");
  const details = findSceneSurfaceDetails(context, family);
  if (details.length === 0)
    throw new InvalidOperationError(Operation.Update, family, "no material of the scene draws its surface detail");
  for (const { amplitudes: uniforms } of details)
    for (const [octave, uniform] of uniforms.entries()) uniform.value = amplitudes[octave] ?? 0;
};

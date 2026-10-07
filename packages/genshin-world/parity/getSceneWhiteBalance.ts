import type { SceneContext } from "#src/models/scene/SceneContext";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The white balance the scene's frame passes through before the tone curve, its matrix's elements column by column as
// The scene holds them, so a tool solving a light off a reference takes each colour back through it
export const getSceneWhiteBalance = (context: SceneContext | undefined): number[] => {
  if (!context) throw new InvalidOperationError(Operation.Read, "scene", "not rendered yet");
  return [...context.whiteBalance.value.elements];
};

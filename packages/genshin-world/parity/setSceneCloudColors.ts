import type { SceneContext } from "#src/models/scene/SceneContext";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { toSceneColor } from "genshin-engine";
import { Color, Matrix3 } from "three";

// The colours the sky's clouds are drawn in, lit or shaded or both, toward the sun and away alike, each as the colour
// The screen shows, as a sky state holds it: written as the scene colour the white balance and the tone curve show as
// It, so a tool solves the colours a sky state ships
export const setSceneCloudColors = (
  context: SceneContext | undefined,
  { lit, shade }: { lit?: [number, number, number]; shade?: [number, number, number] },
): void => {
  if (!context?.sky) throw new InvalidOperationError(Operation.Read, "scene", "no sky handed on, or not rendered yet");
  const inverseWhiteBalance = new Matrix3().copy(context.whiteBalance.value).invert();
  const { cloudLitBackColor, cloudLitColor, cloudShadeBackColor, cloudShadeColor } = context.sky;
  for (const [{ value }, shown] of [
    [cloudLitColor, lit],
    [cloudLitBackColor, lit],
    [cloudShadeColor, shade],
    [cloudShadeBackColor, shade],
  ] as const)
    if (shown) toSceneColor(new Color(...shown), value).applyMatrix3(inverseWhiteBalance);
};

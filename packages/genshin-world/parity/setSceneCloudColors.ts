import type { SceneContext } from "#src/models/scene/SceneContext";

import { InvalidOperationError, Operation } from "@esposter/shared";

// Each sky's own cloud colours, kept the first time a tool sets them so they can be handed back
const ownColorsMap = new WeakMap<object, number[][]>();
// The colours the sky's clouds are drawn in, lit and shaded, toward the sun and away alike, set in the scene's own
// Colour, or handed back to the scene's own when none are given: a tool draws the clouds under black and white in turn,
// So each pixel's share of the lit colour and the shaded one is read apart. The first call keeps the scene's own
export const setSceneCloudColors = (
  context: SceneContext | undefined,
  colors?: { lit: [number, number, number]; shade: [number, number, number] },
): void => {
  if (!context?.sky) throw new InvalidOperationError(Operation.Read, "scene", "no sky handed on, or not rendered yet");
  const { cloudLitBackColor, cloudLitColor, cloudShadeBackColor, cloudShadeColor } = context.sky;
  const uniforms = [cloudLitColor, cloudLitBackColor, cloudShadeColor, cloudShadeBackColor];
  const ownColors = ownColorsMap.get(context.sky) ?? uniforms.map(({ value }) => value.toArray());
  ownColorsMap.set(context.sky, ownColors);
  for (const [index, { value }] of uniforms.entries()) {
    const [red = 0, green = 0, blue = 0] = colors ? (index < 2 ? colors.lit : colors.shade) : (ownColors[index] ?? []);
    value.setRGB(red, green, blue);
  }
};

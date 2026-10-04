import type { Vector } from "#src/models/shared/Vector";

import { LUMINANCE } from "#src/services/genshinParity/shared/constants";
import { solveNonNegativeSystem } from "#src/services/genshinParity/shared/solveNonNegativeSystem";
import { SKY_TERMS } from "#src/services/genshinParity/sky/constants";

// A pixel standing over the sky solved by more than this share of the pixels' typical distance from it, or under it by
// More than this many times that distance, is left out of the residual
const BRIGHT_TRIM_FACTOR = 0.5;
const TRIM_FACTOR = 2.5;
// The sky's colours at a shape, solved by least squares on each channel apart over the sky's clear pixels in scene
// Colour, none of them negative (`solveNonNegativeSystem`): a colour clamped after a free solve leaves the terms it
// Cancelled too bright, which drew a lavender dusk salmon. The residual, which a shape is refined on, is the root mean
// Square over the pixels kept, those standing within the pixels' typical distance of the sky solved: a clear sky's
// Mask still holds haze lit across it, which read with the rest bends the shape to it
export const fitSky = (
  samples: readonly { color: Vector; weights: readonly number[] }[],
): { colors: Vector[]; kept: number; residual: number } => {
  const termCount = SKY_TERMS.length;
  const solved = ([0, 1, 2] as const).map((channel) => {
    const normal = Array.from({ length: termCount }, () => Array.from({ length: termCount }, () => 0));
    const right = Array.from({ length: termCount }, () => 0);
    for (const { color, weights } of samples)
      for (let row = 0; row < termCount; row++) {
        right[row] = (right[row] ?? 0) + (weights[row] ?? 0) * color[channel];
        const normalRow = normal[row] ?? [];
        for (let column = 0; column < termCount; column++)
          normalRow[column] = (normalRow[column] ?? 0) + (weights[row] ?? 0) * (weights[column] ?? 0);
      }
    // A term no pixel weighs (no moon in a day sky) is held at none by a touch of damping
    for (let row = 0; row < termCount; row++) (normal[row] ?? [])[row] = (normal[row]?.[row] ?? 0) + 1e-6;
    return solveNonNegativeSystem(normal, right);
  });
  const colors = SKY_TERMS.map((_, term): Vector => [
    solved[0]?.[term] ?? 0,
    solved[1]?.[term] ?? 0,
    solved[2]?.[term] ?? 0,
  ]);
  const differences = samples.map(({ color, weights }) =>
    ([0, 1, 2] as const).map(
      (channel) =>
        color[channel] - weights.reduce((sum, weight, term) => sum + weight * (colors[term]?.[channel] ?? 0), 0),
    ),
  );
  // Each pixel's luminance over the sky solved, a lit haze's above it
  const brightnesses = differences.map((difference) =>
    difference.reduce((sum, value, channel) => sum + (LUMINANCE[channel] ?? 0) * value, 0),
  );
  const spread =
    brightnesses.map((brightness) => Math.abs(brightness)).toSorted((first, second) => first - second)[
      Math.floor(brightnesses.length / 2)
    ] ?? 0;
  const kept = differences.filter((_, index) => {
    const brightness = brightnesses[index] ?? 0;
    return brightness <= spread * BRIGHT_TRIM_FACTOR && brightness >= -spread * TRIM_FACTOR;
  });
  const residual = Math.sqrt(
    kept.reduce((sum, difference) => sum + difference.reduce((channelSum, value) => channelSum + value ** 2, 0), 0) /
      Math.max(kept.length * 3, 1),
  );
  return { colors, kept: kept.length, residual };
};

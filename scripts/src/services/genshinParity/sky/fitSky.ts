import type { Vector } from "#src/models/shared/Vector";

import { LUMINANCE } from "#src/services/genshinParity/shared/constants";
import { solveNonNegativeSystem } from "#src/services/genshinParity/shared/solveNonNegativeSystem";
import { SKY_GRADIENT_TERMS, SKY_TERMS } from "#src/services/genshinParity/sky/constants";
import { TONE_CURVE_FLOOR } from "genshin-engine";

// A pixel standing over the sky solved by more than this share of the pixels' typical distance from it, or under it by
// More than this many times that distance, is left out of the residual
const BRIGHT_TRIM_FACTOR = 0.5;
const TRIM_FACTOR = 2.5;
// The least each term may stand at: a gradient's colour down to the tone curve's floor, which the night's red shows
// Under the curve's black at none, and a halo or a glow, which only adds light, at none
const TERM_FLOORS = SKY_TERMS.map((term) =>
  SKY_GRADIENT_TERMS.some((gradientTerm) => gradientTerm === term) ? TONE_CURVE_FLOOR : 0,
);
// The sky's colours at a shape, solved by least squares on each channel apart over the sky's clear pixels in scene
// Colour, none of them under its floor (`solveNonNegativeSystem` over each term's excess on it): a colour clamped
// After a free solve leaves the terms it cancelled too bright, which drew a lavender dusk salmon. Each pixel's channel
// Is weighted by the tone curve's slope there (`getToneSlope`), so the solve and its residual are of what the screen
// Shows, to first order. The residual,
// Which a shape is refined on, is the root mean square over the pixels kept, those standing within the pixels' typical
// Distance of the sky solved: a clear sky's mask still holds haze lit across it, which read with the rest bends the
// Shape to it
export const fitSky = (
  samples: readonly { color: Vector; slope: Vector; weights: readonly number[] }[],
): { colors: Vector[]; fullResidual: number; kept: number; residual: number } => {
  const termCount = SKY_TERMS.length;
  const solved = ([0, 1, 2] as const).map((channel) => {
    const normal = Array.from({ length: termCount }, () => Array.from({ length: termCount }, () => 0));
    const right = Array.from({ length: termCount }, () => 0);
    for (const { color, slope, weights } of samples) {
      const emphasis = slope[channel] ** 2;
      const excess = color[channel] - weights.reduce((sum, weight, term) => sum + weight * (TERM_FLOORS[term] ?? 0), 0);
      for (let row = 0; row < termCount; row++) {
        right[row] = (right[row] ?? 0) + emphasis * (weights[row] ?? 0) * excess;
        const normalRow = normal[row] ?? [];
        for (let column = 0; column < termCount; column++)
          normalRow[column] = (normalRow[column] ?? 0) + emphasis * (weights[row] ?? 0) * (weights[column] ?? 0);
      }
    }
    // A term no pixel weighs (no moon in a day sky) is held at none by a touch of damping
    for (let row = 0; row < termCount; row++) (normal[row] ?? [])[row] = (normal[row]?.[row] ?? 0) + 1e-6;
    return solveNonNegativeSystem(normal, right).map((value, term) => value + (TERM_FLOORS[term] ?? 0));
  });
  const colors = SKY_TERMS.map((_value, term): Vector => [
    solved[0]?.[term] ?? 0,
    solved[1]?.[term] ?? 0,
    solved[2]?.[term] ?? 0,
  ]);
  const differences = samples.map(({ color, slope, weights }) =>
    ([0, 1, 2] as const).map(
      (channel) =>
        slope[channel] *
        (color[channel] - weights.reduce((sum, weight, term) => sum + weight * (colors[term]?.[channel] ?? 0), 0)),
    ),
  );
  // Each pixel's luminance over the sky solved, a lit haze's above it
  const brightnesses = differences.map((difference) =>
    difference.reduce((sum, value, channel) => sum + (LUMINANCE[channel] ?? 0) * value, 0),
  );
  const spread =
    brightnesses
      .map((brightness) => Math.abs(brightness))
      .toSorted((firstBrightness, secondBrightness) => firstBrightness - secondBrightness)[
      Math.floor(brightnesses.length / 2)
    ] ?? 0;
  const kept = differences.filter((_value, index) => {
    const brightness = brightnesses[index] ?? 0;
    return brightness <= spread * BRIGHT_TRIM_FACTOR && brightness >= -spread * TRIM_FACTOR;
  });
  const residual = Math.sqrt(
    kept.reduce((sum, difference) => sum + difference.reduce((channelSum, value) => channelSum + value ** 2, 0), 0) /
      Math.max(kept.length * 3, 1),
  );
  // Over every pixel, so a shape or a sun that only trims the pixels it misses does not read as a closer sky
  const fullResidual = Math.sqrt(
    differences.reduce(
      (sum, difference) => sum + difference.reduce((channelSum, value) => channelSum + value ** 2, 0),
      0,
    ) / Math.max(differences.length * 3, 1),
  );
  return { colors, fullResidual, kept: kept.length, residual };
};

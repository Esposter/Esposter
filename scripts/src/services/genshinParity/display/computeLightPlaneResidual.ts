import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";

import { findSmallestEigenvector } from "#src/services/genshinParity/witness/findSmallestEigenvector";
import { TONE_CONTRAST_OFFSET, TONE_CURVE_LIFT } from "genshin-engine";

// How far the light the samples stand under strays from the plane two light colours span, under the tone curve at a
// Contrast: each sample's colour taken back through the curve and divided by its albedo is the light on it, which a
// Sun and a sky, whatever their colours and however much of each a pixel takes, keep on one plane through black. The
// Lights are scaled to one length, so a dim pixel weighs as much as a bright one, and what the plane leaves is the
// Smallest eigenvalue of their scatter over its trace. The curve's exposure only scales every light alike, so the plane
// Never sees it, while its contrast bends each channel apart as the light rises, and only the right one lays them flat
export const computeLightPlaneResidual = (samples: readonly DisplaySample[], contrast: number): number => {
  const scatter = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const light = [0, 0, 0];
  for (const { albedo, display } of samples) {
    for (let channel = 0; channel < 3; channel++) {
      const shown = Math.min(Math.max(display[channel] ?? 0, 0), 1);
      light[channel] =
        -Math.log2(1 + TONE_CURVE_LIFT - shown ** (1 / (contrast + TONE_CONTRAST_OFFSET))) / (albedo[channel] ?? 1);
    }
    const length = Math.hypot(...light);
    if (length === 0) continue;
    for (const [row, rowValues] of scatter.entries())
      for (let column = 0; column < 3; column++)
        rowValues[column] = (rowValues[column] ?? 0) + ((light[row] ?? 0) * (light[column] ?? 0)) / length ** 2;
  }
  const normal = findSmallestEigenvector(scatter);
  const planeScatter = scatter.reduce(
    (sum, rowValues, row) =>
      sum + rowValues.reduce((rowSum, value, column) => rowSum + (normal[row] ?? 0) * value * (normal[column] ?? 0), 0),
    0,
  );
  const trace = scatter.reduce((sum, rowValues, row) => sum + (rowValues[row] ?? 0), 0);
  return trace === 0 ? 0 : planeScatter / trace;
};

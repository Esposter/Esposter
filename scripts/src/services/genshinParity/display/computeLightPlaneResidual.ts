import type { DisplaySample } from "#src/models/genshinParity/display/DisplaySample";

import { findSmallestEigenvector } from "#src/services/genshinParity/witness/findSmallestEigenvector";
import { TONE_CONTRAST_OFFSET, TONE_CURVE_LIFT } from "genshin-engine";
import { Matrix3, Vector3 } from "three";

const offPlane = new Vector3();
const inverseWhiteBalance = new Matrix3();
// How far the light the samples stand under strays from the plane two light colours span, under the tone curve at a
// Contrast: each sample's colour taken back through the curve, then through the white balance's inverse where one is
// Given, and divided by its albedo is the light on it, which a sun and a sky, whatever their colours and however much
// Of each a pixel takes, keep on one plane through black. The lights are scaled to one length, so a dim pixel weighs
// As much as a bright one, and what the plane leaves is the smallest eigenvalue of their scatter over its trace. The
// Curve's exposure only scales every light alike, so the plane never sees it, while its contrast bends each channel
// Apart as the light rises, and only the right one lays them flat. With a balance, what each light leaves off the
// Plane is taken back through its albedo and the balance and read against the pixel's own colour: a balance near
// Singular flattens every light onto a plane by itself, which read where the light lies would score as exact
export const computeLightPlaneResidual = (
  samples: readonly DisplaySample[],
  contrast: number,
  whiteBalance?: Matrix3,
): number => {
  if (whiteBalance) inverseWhiteBalance.copy(whiteBalance).invert();
  else inverseWhiteBalance.identity();
  const sceneColors = samples.map(({ display }) =>
    new Vector3().fromArray(
      display.map(
        (channel) =>
          -Math.log2(
            1 + TONE_CURVE_LIFT - Math.min(Math.max(channel, 0), 1) ** (1 / (contrast + TONE_CONTRAST_OFFSET)),
          ),
      ),
    ),
  );
  const lights = samples.map(({ albedo }, index) => {
    const balanced = (sceneColors[index] ?? new Vector3()).clone().applyMatrix3(inverseWhiteBalance);
    return [0, 1, 2].map((channel) => balanced.getComponent(channel) / (albedo[channel] ?? 1));
  });
  const scatter = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (const light of lights) {
    const length = Math.hypot(...light);
    if (length === 0) continue;
    for (const [row, rowValues] of scatter.entries())
      for (let column = 0; column < 3; column++)
        rowValues[column] = (rowValues[column] ?? 0) + ((light[row] ?? 0) * (light[column] ?? 0)) / length ** 2;
  }
  const normal = findSmallestEigenvector(scatter);
  if (whiteBalance) {
    let [sum, count] = [0, 0];
    for (const [index, light] of lights.entries()) {
      const shownLength = sceneColors[index]?.length() ?? 0;
      if (shownLength === 0) continue;
      const albedo = samples[index]?.albedo ?? [1, 1, 1];
      const distance = light.reduce((total, value, channel) => total + value * (normal[channel] ?? 0), 0);
      offPlane
        .fromArray(normal.map((value, channel) => value * distance * (albedo[channel] ?? 1)))
        .applyMatrix3(whiteBalance);
      sum += offPlane.lengthSq() / shownLength ** 2;
      count++;
    }
    return count === 0 ? 0 : sum / count;
  }
  const planeScatter = scatter.reduce(
    (sum, rowValues, row) =>
      sum + rowValues.reduce((rowSum, value, column) => rowSum + (normal[row] ?? 0) * value * (normal[column] ?? 0), 0),
    0,
  );
  const trace = scatter.reduce((sum, rowValues, row) => sum + (rowValues[row] ?? 0), 0);
  return trace === 0 ? 0 : planeScatter / trace;
};

import type { SkyShape } from "genshin-engine";

import { solveLinearSystem } from "#src/services/genshinParity/solveLinearSystem";

type Vector = [number, number, number];
// The terms of the game's sky a pixel's colour is a sum of, each a colour the fit solves (Login/Scene/Index.reference.ts,
// Source `atmosphereShader`): the top and bottom colours away from the sun and toward it, the horizon halo, the sun's
// Halo and the moon's glow
export const SKY_TERMS = ["zenithBack", "zenith", "horizonBack", "horizon", "halo", "sunHalo", "moonGlow"] as const;
const LEAST_DIVISOR = 1e-4;
// A pixel further from the solved colour than this many times the median, a cloud or a tower's haze, is left out of the
// Next solve, the sky's own pixels the most of them
const TRIM_FACTOR = 2.5;
// A pixel standing brighter than the sky solved by more than this many times the pixels' typical distance from it is a
// Cloud or the haze lit across it, left out however many there are: clouds over half a dusk sky make the median
// Distance a cloud's, so a trim even both ways keeps them all and the sky is solved as their mean
const BRIGHT_TRIM_FACTOR = 0.5;
const TRIM_PASSES = 8;
const LUMINANCE = [0.2126, 0.7152, 0.0722] as const;
const dot = (first: Vector, second: Vector): number =>
  first[0] * second[0] + first[1] * second[1] + first[2] * second[2];
const smoothstep = (value: number): number => {
  const clamped = Math.min(Math.max(value, 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
};
const saturate = (value: number): number => Math.min(Math.max(value, 0), 1);
// A curve of evenly spaced samples read linearly at a share from 0 to 1, clamped at its ends
const readCurve = (samples: readonly number[], share: number): number => {
  const position = saturate(share) * (samples.length - 1);
  const left = Math.floor(position);
  const right = Math.min(left + 1, samples.length - 1);
  return (samples[left] ?? 0) + ((samples[right] ?? 0) - (samples[left] ?? 0)) * (position - left);
};
// Each term's weight at a ray, as the game's sky shader sums them: the sky's colour from its gradient, blended from away
// From the sun to toward it, the halo over its reach toward the sun and all round once the sun is up, the sun's halo
// As three widening lobes and the moon's glow
export const readSkyWeights = (
  direction: Vector,
  { moonDirection, sunDirection }: { moonDirection: Vector; sunDirection: Vector },
  gradient: { green: readonly number[]; red: readonly number[] },
  { frontBackBlend, haloHeight, horizonBand, moonSize, sunHaloSize }: SkyShape,
): number[] => {
  const height = direction[1];
  const elevation = Math.abs((Math.asin(Math.min(Math.max(height, -1), 1)) * 2) / Math.PI);
  const sunCosine = dot(direction, sunDirection);
  const toward = Math.max(sunCosine * frontBackBlend + 1 - frontBackBlend, 0) ** 3;
  const bottomShare = readCurve(gradient.red, elevation / Math.max(horizonBand, LEAST_DIVISOR));
  const haloShare = readCurve(gradient.green, elevation / Math.max(haloHeight, LEAST_DIVISOR));
  const sunSide = saturate(sunCosine * 0.5 + 0.5);
  const towardSun = smoothstep(Math.max((sunSide - 0.3) / 0.7, 0));
  const sunUp = smoothstep(saturate((Math.abs(sunDirection[1]) - 0.2) / 0.3));
  const spread = sunHaloSize * Math.abs(height);
  const sunHalo =
    (Math.min(sunSide ** spread, 1) +
      Math.min(sunSide ** (spread * 0.1), 1) * 0.12 +
      Math.min(sunSide ** (spread * 0.01), 1) * 0.03) *
    smoothstep(Math.max((sunSide - 0.5) * 2, 0));
  const moonCosine = saturate(dot(direction, moonDirection));
  const moonGlow = Math.max((moonCosine - 1) / Math.max(moonSize * 0.1, LEAST_DIVISOR) + 1, 0) ** 6;
  return [
    (1 - toward) * (1 - bottomShare),
    toward * (1 - bottomShare),
    (1 - toward) * bottomShare,
    toward * bottomShare,
    haloShare * (sunUp * (1 - towardSun) + towardSun),
    sunHalo,
    moonGlow,
  ];
};
// The sky's colours at a shape, solved by least squares on each channel apart over the sky's pixels in scene colour,
// Each kept at or above none, the pixels standing brighter than it left out pass by pass, and the darkest far off it,
// So the clouds and the haze lit across the sky do not pull it up to their mean. The residual is the root mean square over the pixels kept
export const fitSky = (
  samples: readonly { color: Vector; weights: readonly number[] }[],
): { colors: Vector[]; kept: number; residual: number } => {
  let kept = samples;
  let colors: Vector[] = SKY_TERMS.map((): Vector => [0, 0, 0]);
  for (let pass = 0; pass < TRIM_PASSES; pass++) {
    const termCount = SKY_TERMS.length;
    const passKept = kept;
    const solved = ([0, 1, 2] as const).map((channel) => {
      const normal = Array.from({ length: termCount }, () => Array.from({ length: termCount }, () => 0));
      const right = Array.from({ length: termCount }, () => 0);
      for (const { color, weights } of passKept)
        for (let row = 0; row < termCount; row++) {
          right[row] = (right[row] ?? 0) + (weights[row] ?? 0) * color[channel];
          for (let column = 0; column < termCount; column++)
            (normal[row] ?? [])[column] = (normal[row]?.[column] ?? 0) + (weights[row] ?? 0) * (weights[column] ?? 0);
        }
      // A term no pixel weighs (no moon in a day sky) is held at none by a touch of damping
      for (let row = 0; row < termCount; row++) (normal[row] ?? [])[row] = (normal[row]?.[row] ?? 0) + 1e-6;
      return (solveLinearSystem(normal, right) ?? right.map(() => 0)).map((value) => Math.max(value, 0));
    });
    const passColors = SKY_TERMS.map((_, term): Vector => [
      solved[0]?.[term] ?? 0,
      solved[1]?.[term] ?? 0,
      solved[2]?.[term] ?? 0,
    ]);
    colors = passColors;
    // Each pixel's luminance over the sky solved, a cloud's above it
    const brightnesses = samples.map(({ color, weights }) =>
      ([0, 1, 2] as const).reduce(
        (sum: number, channel) =>
          sum +
          LUMINANCE[channel] *
            (color[channel] -
              weights.reduce((termSum, weight, term) => termSum + weight * (passColors[term]?.[channel] ?? 0), 0)),
        0,
      ),
    );
    const spread =
      brightnesses.map((brightness) => Math.abs(brightness)).toSorted((first, second) => first - second)[
        Math.floor(brightnesses.length / 2)
      ] ?? 0;
    kept = samples.filter((_, index) => {
      const brightness = brightnesses[index] ?? 0;
      return brightness <= spread * BRIGHT_TRIM_FACTOR && brightness >= -spread * TRIM_FACTOR;
    });
  }
  const residual = Math.sqrt(
    kept.reduce(
      (sum, { color, weights }) =>
        sum +
        ([0, 1, 2] as const).reduce(
          (channelSum: number, channel) =>
            channelSum +
            (color[channel] -
              weights.reduce((termSum, weight, term) => termSum + weight * (colors[term]?.[channel] ?? 0), 0)) **
              2,
          0,
        ),
      0,
    ) / Math.max(kept.length * 3, 1),
  );
  return { colors, kept: kept.length, residual };
};

import type { SkyShape } from "genshin-engine";

import { solveNonNegativeSystem } from "#src/services/genshinParity/solveNonNegativeSystem";

type Vector = [number, number, number];
// The terms of the game's sky a pixel's colour is a sum of, each a colour the fit solves (Login/Scene/Index.reference.ts,
// Source `atmosphereShader`): the top and bottom colours away from the sun and toward it, the horizon halo, the sun's
// Halo and the moon's glow
export const SKY_TERMS = ["zenithBack", "zenith", "horizonBack", "horizon", "halo", "sunHalo", "moonGlow"] as const;
const LEAST_DIVISOR = 1e-4;
// A pixel standing over the sky solved by more than this share of the pixels' typical distance from it, or under it by
// More than this many times that distance, is left out of the residual
const BRIGHT_TRIM_FACTOR = 0.5;
const TRIM_FACTOR = 2.5;
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

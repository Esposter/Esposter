import type { Vector } from "#src/models/shared/Vector";
import type { SkyShape } from "genshin-engine";

const LEAST_DIVISOR = 1e-4;
const dot = (first: Vector, second: Vector): number =>
  first[0] * second[0] + first[1] * second[1] + first[2] * second[2];
const smoothstep = (value: number): number => {
  const clamped = Math.min(Math.max(value, 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
};
const saturate = (value: number): number => Math.min(Math.max(value, 0), 1);
// A curve of evenly spaced samples read linearly at a share from 0 to 1, clamped at its ends
const getCurve = (samples: readonly number[], share: number): number => {
  const position = saturate(share) * (samples.length - 1);
  const left = Math.floor(position);
  const right = Math.min(left + 1, samples.length - 1);
  return (samples[left] ?? 0) + ((samples[right] ?? 0) - (samples[left] ?? 0)) * (position - left);
};
// Each term's weight at a ray, as the game's sky shader sums them: the sky's colour from its gradient, blended from away
// From the sun to toward it, the halo over its reach toward the sun and all round once the sun is up, the sun's halo
// As three widening lobes and the moon's glow
export const computeSkyWeights = (
  direction: Vector,
  { moonDirection, sunDirection }: { moonDirection: Vector; sunDirection: Vector },
  gradient: { green: readonly number[]; red: readonly number[] },
  { frontBackBlend, haloHeight, horizonBand, moonSize, sunHaloSize }: SkyShape,
): number[] => {
  const height = direction[1];
  const elevation = Math.abs((Math.asin(Math.min(Math.max(height, -1), 1)) * 2) / Math.PI);
  const sunCosine = dot(direction, sunDirection);
  const toward = Math.max(sunCosine * frontBackBlend + 1 - frontBackBlend, 0) ** 3;
  const bottomShare = getCurve(gradient.red, elevation / Math.max(horizonBand, LEAST_DIVISOR));
  const haloShare = getCurve(gradient.green, elevation / Math.max(haloHeight, LEAST_DIVISOR));
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

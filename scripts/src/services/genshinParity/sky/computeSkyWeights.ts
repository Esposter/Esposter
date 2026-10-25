import type { Vector } from "#src/models/shared/Vector";
import type { SkyShape } from "genshin-engine";

import { clamp } from "#src/services/genshinParity/shared/clamp";
import { dot } from "#src/services/genshinParity/sky/dot";
import { getCurve } from "#src/services/genshinParity/sky/getCurve";
import { smoothstep } from "#src/services/genshinParity/sky/smoothstep";

const LEAST_DIVISOR = 1e-4;

// Each term's weight at a ray, as the game's sky shader sums them: the sky's colour from its gradient, blended from
// Away from the sun to toward it, the halo over its reach toward the sun and all round once the sun is up, the sun's
// Halo as three widening lobes and the moon's glow
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
  const sunSide = clamp(sunCosine * 0.5 + 0.5, 0, 1);
  const towardSun = smoothstep(Math.max((sunSide - 0.3) / 0.7, 0));
  const sunUp = smoothstep(clamp((Math.abs(sunDirection[1]) - 0.2) / 0.3, 0, 1));
  const spread = sunHaloSize * Math.abs(height);
  const sunHalo =
    (Math.min(sunSide ** spread, 1) +
      Math.min(sunSide ** (spread * 0.1), 1) * 0.12 +
      Math.min(sunSide ** (spread * 0.01), 1) * 0.03) *
    smoothstep(Math.max((sunSide - 0.5) * 2, 0));
  const moonCosine = clamp(dot(direction, moonDirection), 0, 1);
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

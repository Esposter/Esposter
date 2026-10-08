import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";
import type { StoneLight } from "genshin-engine";

import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { writeStoneRampWeights } from "#src/services/genshinParity/witness/writeStoneRampWeights";
import { computeStoneDarkening, STONE_HEIGHT_FALLOFF, STONE_RAMP_KNOT_COUNT } from "genshin-engine";

// The scene colour a stone light casts on one sample, as `solveStoneLight` models the deferred pass: its albedo times
// The ramp at its coordinate, the harmonics at its normal and the light fading with its height, all darkening with its
// Height (`computeStoneDarkening`), with its glow, darkened by its occlusion, the part the haze lets through, plus the haze's colour blended toward its sunward one by its
// Scatter, by its opacity
export const computeStoneSampleColor = (
  { albedo, emission, harmonics: terms, height, occlusion, opacity, rampCoordinate, scatter }: StoneLightSample,
  { harmonics, hazeColor, hazeScatterColor, heightDarkening, heightFade, ramp }: StoneLight,
): Vector => {
  const weights = Array.from({ length: STONE_RAMP_KNOT_COUNT }, () => 0);
  writeStoneRampWeights(rampCoordinate, weights);
  const fade = Math.exp(-height * STONE_HEIGHT_FALLOFF);
  const darkening = computeStoneDarkening(height, heightDarkening);
  return CHANNELS.map((channel) => {
    const rampLight = weights.reduce((sum, weight, knot) => sum + weight * (ramp[knot]?.[channel] ?? 0), 0);
    const skyLight = terms.reduce((sum, term, index) => sum + term * (harmonics[index]?.[channel] ?? 0), 0);
    const light = (rampLight + skyLight + (heightFade[channel] ?? 0) * fade) * darkening;
    const through = occlusion * (1 - opacity);
    const haze = (1 - scatter) * (hazeColor[channel] ?? 0) + scatter * (hazeScatterColor[channel] ?? 0);
    return (albedo[channel] * light + emission[channel]) * through + opacity * haze;
  }) as Vector;
};

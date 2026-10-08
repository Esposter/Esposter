import type { StoneLightSample } from "#src/models/genshinParity/witness/StoneLightSample";
import type { Vector } from "#src/models/shared/Vector";
import type { StoneLight } from "genshin-engine";
import type { Matrix3 } from "three";

import { TONE_CURVE_BLACK_BYTE } from "#src/services/genshinParity/display/constants";
import { CHANNELS } from "#src/services/genshinParity/shared/constants";
import { computeStoneSampleColor } from "#src/services/genshinParity/witness/computeStoneSampleColor";
import { BYTE } from "#src/services/shared/constants";
import { toLinear } from "#src/services/shared/toLinear";
import { toneMapGenshin } from "genshin-engine";
import { Vector3 } from "three";

// The curve's black in linear channels, as a channel shown a byte under it is read
const CURVE_BLACK = toLinear(TONE_CURVE_BLACK_BYTE / BYTE);
// The reference's green the samples are banded by, from its least to its most in bands holding as many each
const GREEN = 1;
// Over a reference's stone samples in bands of how bright the reference shows their green, each band's share whose
// Each channel stands under the tone curve's black: the reference's as its frame shows it, and ours as the light given
// Casts it (`computeStoneSampleColor`) through the white balance and the curve, so a balance is judged by the very
// Pixels its light is solved over. A balance mixes the other channels into each, so how bright a pixel's green stands
// When its red goes under is what tells one balance from another taking as many pixels under in all
export const compareSampleUnderBlackShares = (
  samples: readonly StoneLightSample[],
  light: StoneLight,
  whiteBalance: Matrix3,
  bandCount = 1,
): { ours: Vector; reference: Vector }[] => {
  const balanced = new Vector3();
  const sorted = samples.toSorted(
    (firstSample, secondSample) => firstSample.display[GREEN] - secondSample.display[GREEN],
  );
  return Array.from({ length: bandCount }, (_band, band) => {
    const bandSamples = sorted.slice(
      Math.floor((band * sorted.length) / bandCount),
      Math.floor(((band + 1) * sorted.length) / bandCount),
    );
    const ours: Vector = [0, 0, 0];
    const reference: Vector = [0, 0, 0];
    for (const sample of bandSamples) {
      balanced.fromArray(computeStoneSampleColor(sample, light)).applyMatrix3(whiteBalance);
      const shown = toneMapGenshin([balanced.x, balanced.y, balanced.z]);
      for (const channel of CHANNELS) {
        if (shown[channel] < CURVE_BLACK) ours[channel]++;
        if (sample.display[channel] < CURVE_BLACK) reference[channel]++;
      }
    }
    const count = Math.max(bandSamples.length, 1);
    return {
      ours: ours.map((under) => under / count) as Vector,
      reference: reference.map((under) => under / count) as Vector,
    };
  });
};

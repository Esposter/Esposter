import type { RadianceFrames } from "#src/models/genshinParity/radiance/RadianceFrames";
import type { RadianceTally } from "#src/models/genshinParity/radiance/RadianceTally";
import type { RadianceTriple } from "#src/models/genshinParity/radiance/RadianceTriple";

import { RadianceLight } from "#src/models/genshinParity/radiance/RadianceLight";
import { addRadianceTriples } from "#src/services/genshinParity/radiance/addRadianceTriples";
import { getRadianceTally } from "#src/services/genshinParity/radiance/getRadianceTally";
import { toRadianceByte } from "#src/services/genshinParity/radiance/toRadianceByte";
import { BYTE } from "#src/services/shared/constants";

// The family a pixel no part stands at is tallied under: the sky, and whatever the exports do not draw
export const OUTSIDE_PARTS = "outside the parts";
// The share of the sun our render lets reach a pixel from which the pixel is lit, and under which it is shaded
const SUN_REACHES = 0.5;

// The family a pixel's part index names, or the outside family where no part stands
const getFamilyName = (families: readonly string[], index: number): string =>
  index < 0 ? OUTSIDE_PARTS : (families[Math.round(index)] ?? OUTSIDE_PARTS);

// A frame's three channel bytes at a pixel
const readBytes = (frame: Buffer, pixel: number): RadianceTriple => [
  frame[pixel * 3] ?? 0,
  frame[pixel * 3 + 1] ?? 0,
  frame[pixel * 3 + 2] ?? 0,
];

// The scene radiance of a pixel's three channel bytes
const toRadianceTriple = ([red, green, blue]: RadianceTriple): RadianceTriple => [
  toRadianceByte(red),
  toRadianceByte(green),
  toRadianceByte(blue),
];

// Sorts each scored pixel into its family and its light, and sums both frames' radiance there, so each family's
// Radiance is ours beside the reference's over the same pixels. A pixel with a saturated channel on either frame is
// Counted as clipped in its family and light, and summed nowhere
export const tallyRadiance = ({
  families,
  family,
  height,
  ours,
  reference,
  scored,
  shadow,
  width,
}: RadianceFrames): RadianceTally[] => {
  const tallies = new Map<string, RadianceTally>();
  for (let pixel = 0; pixel < width * height; pixel++) {
    if (!scored[pixel]) continue;
    const referenceBytes = readBytes(reference, pixel);
    const oursBytes = readBytes(ours, pixel);
    const familyName = getFamilyName(families, family[pixel] ?? -1);
    const light = (shadow[pixel] ?? 0) > SUN_REACHES ? RadianceLight.Lit : RadianceLight.Shaded;
    const isClipped = [...referenceBytes, ...oursBytes].includes(BYTE);
    const tallyLights = [light, RadianceLight.All];
    if (isClipped) {
      for (const tallyLight of tallyLights) getRadianceTally(tallies, familyName, tallyLight).clipped++;
      continue;
    }
    const referenceRadiance = toRadianceTriple(referenceBytes);
    const oursRadiance = toRadianceTriple(oursBytes);
    for (const tallyLight of tallyLights) {
      const tally = getRadianceTally(tallies, familyName, tallyLight);
      tally.pixels++;
      tally.reference = addRadianceTriples(tally.reference, referenceRadiance);
      tally.ours = addRadianceTriples(tally.ours, oursRadiance);
    }
  }
  return [...tallies.values()];
};

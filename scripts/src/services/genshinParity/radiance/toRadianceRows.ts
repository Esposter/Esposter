import type { RadianceRow } from "#src/models/genshinParity/radiance/RadianceRow";
import type { RadianceTally } from "#src/models/genshinParity/radiance/RadianceTally";

// The table's rows from the tallies: each family's light with a pixel in it, its mean radiance on both sides, the ratio
// Of ours to the reference over the channels together, and the ratio channel by channel
export const toRadianceRows = (tallies: readonly RadianceTally[]): RadianceRow[] =>
  tallies
    .filter(({ pixels }) => pixels > 0)
    .map(({ clipped, family, light, ours, pixels, reference }) => {
      const oursSum = ours[0] + ours[1] + ours[2];
      const referenceSum = reference[0] + reference[1] + reference[2];
      return {
        channelRatios: [ours[0] / reference[0], ours[1] / reference[1], ours[2] / reference[2]],
        clipped,
        family,
        light,
        oursMean: oursSum / (3 * pixels),
        pixels,
        ratio: oursSum / referenceSum,
        referenceMean: referenceSum / (3 * pixels),
      };
    });

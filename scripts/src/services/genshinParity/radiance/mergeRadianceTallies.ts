import type { RadianceTally } from "#src/models/genshinParity/radiance/RadianceTally";

import { addRadianceTriples } from "#src/services/genshinParity/radiance/addRadianceTriples";
import { getRadianceTally } from "#src/services/genshinParity/radiance/getRadianceTally";

// The tallies of several references summed family by family and light by light, so the table pools them
export const mergeRadianceTallies = (tallyLists: readonly (readonly RadianceTally[])[]): RadianceTally[] => {
  const merged = new Map<string, RadianceTally>();
  for (const tally of tallyLists.flat()) {
    const target = getRadianceTally(merged, tally.family, tally.light);
    target.clipped += tally.clipped;
    target.pixels += tally.pixels;
    target.ours = addRadianceTriples(target.ours, tally.ours);
    target.reference = addRadianceTriples(target.reference, tally.reference);
  }
  return [...merged.values()];
};

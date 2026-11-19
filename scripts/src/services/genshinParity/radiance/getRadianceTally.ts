import type { RadianceLight } from "#src/models/genshinParity/radiance/RadianceLight";
import type { RadianceTally } from "#src/models/genshinParity/radiance/RadianceTally";

// The tally of one family's light in a map of tallies, made empty the first time it is asked for
export const getRadianceTally = (
  tallies: Map<string, RadianceTally>,
  family: string,
  light: RadianceLight,
): RadianceTally => {
  const key = `${family}|${light}`;
  const tally = tallies.get(key);
  if (tally) return tally;
  const entry: RadianceTally = { clipped: 0, family, light, ours: [0, 0, 0], pixels: 0, reference: [0, 0, 0] };
  tallies.set(key, entry);
  return entry;
};

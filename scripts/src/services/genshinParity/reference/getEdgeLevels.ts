// A profile's samples as levels from 0 at its lowest to 1 at its highest, read so an edge always rises: a falling profile is
// Flipped, so its edge reads the same as a rising one
export const getEdgeLevels = (profile: readonly number[], low: number, range: number): number[] => {
  const first = profile[0] ?? 0;
  const last = profile.at(-1) ?? 0;
  return profile.map((value) => (last >= first ? (value - low) / range : (range - (value - low)) / range));
};

import { PROBE_EDGE_LEVEL, PROBE_MIN_EDGE_STEP } from "#src/services/genshinParity/probe/constants";
import { estimateEdgeSigma } from "#src/services/genshinParity/reference/estimateEdgeSigma";
import { findCrossing } from "#src/services/genshinParity/reference/findCrossing";

// The first strong step along a profile read from one side: where it reaches halfway between its lowest and highest
// Samples, in samples from that side. A step is strong when it rises by a whole `PROBE_MIN_EDGE_STEP` and has a sigma, so
// Noise across a flat rectangle is no edge. A profile already past the halfway level at its first sample has its step
// Outside the rectangle on that side, so no step is read there
export const findEdgePosition = (profile: readonly number[]): number | undefined => {
  const low = Math.min(...profile);
  const range = Math.max(...profile) - low;
  if (range < PROBE_MIN_EDGE_STEP || estimateEdgeSigma(profile) === undefined) return undefined;
  const first = profile[0] ?? 0;
  const last = profile.at(-1) ?? 0;
  const levels = profile.map((value) => (last >= first ? (value - low) / range : (range - (value - low)) / range));
  if ((levels[0] ?? 0) >= PROBE_EDGE_LEVEL) return undefined;
  return findCrossing(levels, PROBE_EDGE_LEVEL);
};

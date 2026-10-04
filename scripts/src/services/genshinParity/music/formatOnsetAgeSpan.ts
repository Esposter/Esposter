import { DECAY_AGE_BOUNDS } from "#src/services/genshinParity/shared/constants";

// One span of the time since a note began, as its bounds in seconds
export const formatOnsetAgeSpan = (span: number): string =>
  `${DECAY_AGE_BOUNDS[span - 1] ?? 0}–${DECAY_AGE_BOUNDS[span] ?? "∞"} s`;

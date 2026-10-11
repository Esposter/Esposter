import type { ScoreBand } from "#src/models/dependencies/score/ScoreBand";

// The points of the first band the value is under: the last band is unbounded, so every value finds one
export const getBandPoints = (value: number, bands: ScoreBand[]): number =>
  bands.find(({ below }) => value < below)?.points ?? 0;

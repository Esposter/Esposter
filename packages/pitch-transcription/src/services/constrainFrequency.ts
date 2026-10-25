import { toPitchIndex } from "#src/services/constrainFrequency/toPitchIndex";

// A copy of the readings with every pitch outside the range zeroed: from the highest frequency's pitch up, and below
// The lowest's, each rounded to its nearest key as the model repository rounds it. With no range nothing is zeroed, so
// The readings are handed back as they are, uncopied
export const constrainFrequency = (readings: number[][], maxFrequency?: number, minFrequency?: number): number[][] => {
  if (maxFrequency === undefined && minFrequency === undefined) return readings;
  const end = maxFrequency === undefined ? Infinity : toPitchIndex(maxFrequency);
  const start = minFrequency === undefined ? 0 : toPitchIndex(minFrequency);
  return readings.map((row) => row.map((reading, pitch) => (pitch >= start && pitch < end ? reading : 0)));
};

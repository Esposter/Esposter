import { MIDI_OFFSET } from "#src/constants";

const toPitchIndex = (frequency: number): number => Math.round(12 * Math.log2(frequency / 440) + 69 - MIDI_OFFSET);
// A copy of the readings with every pitch outside the range zeroed: from the highest frequency's pitch up, and below
// The lowest's, each rounded to its nearest key as the model repository rounds it
export const constrainFrequency = (readings: number[][], maxFrequency?: number, minFrequency?: number): number[][] => {
  const end = maxFrequency === undefined ? Infinity : toPitchIndex(maxFrequency);
  const start = minFrequency === undefined ? 0 : toPitchIndex(minFrequency);
  return readings.map((row) => row.map((reading, pitch) => (pitch >= start && pitch < end ? reading : 0)));
};

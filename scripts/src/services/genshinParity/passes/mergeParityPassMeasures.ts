import type { ParityPassMeasure } from "#src/models/genshinParity/shared/ParityPassMeasure";

// The notes and readings of each measure, gathered in order into one measure
export const mergeParityPassMeasures = (measures: readonly ParityPassMeasure[]): ParityPassMeasure => ({
  notes: measures.flatMap(({ notes }) => notes),
  readings: measures.flatMap(({ readings }) => readings),
});

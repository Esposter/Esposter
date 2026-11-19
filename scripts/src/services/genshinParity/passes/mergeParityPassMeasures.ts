import type { ParityPassMeasure } from "#src/models/genshinParity/shared/ParityPassMeasure";

// The notes, diagnostics and readings of each measure, gathered in order into one measure
export const mergeParityPassMeasures = (measures: readonly ParityPassMeasure[]): ParityPassMeasure => ({
  diagnostics: measures.flatMap(({ diagnostics = [] }) => diagnostics),
  notes: measures.flatMap(({ notes }) => notes),
  readings: measures.flatMap(({ readings }) => readings),
});

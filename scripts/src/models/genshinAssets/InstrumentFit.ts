import type { Instrument } from "genshin-engine";

// An instrument fitted to a voice's notes, with how many of them each value was measured from and the median over the
// Notes of the root mean square residual of the envelope's two fitted curves, each a share of a note's level
export interface InstrumentFit {
  decayResidual: number;
  harmonicCounts: number[];
  instrument: Instrument;
  noteCount: number;
  releaseCount: number;
  releaseResidual: number;
}

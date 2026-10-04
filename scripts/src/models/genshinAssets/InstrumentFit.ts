import type { Instrument } from "genshin-engine";
import type { Except } from "type-fest";

// An instrument fitted to a voice's notes, with how many of them each value was measured from and the root mean square
// Residual of the envelope's two fitted curves: the decay's in decibels from the notes' median curve, and the release's
// The median over the notes, a share of a note's level. Its noise is left to the solve over all the voices at once
// (`fitVoiceNoises`)
export interface InstrumentFit {
  decayResidual: number;
  harmonicCounts: number[];
  instrument: Except<Instrument, "noiseBands">;
  noteCount: number;
  releaseCount: number;
  releaseResidual: number;
}

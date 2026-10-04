import type { Instrument } from "genshin-engine";
import type { Except } from "type-fest";

// An instrument fitted to a voice's notes, with how many of them each value was measured from and the median over the
// Notes of the root mean square residual of the envelope's two fitted curves, each a share of a note's level, its noise
// Left to the solve over all the voices at once (`fitVoiceNoises`)
export interface InstrumentFit {
  decayResidual: number;
  harmonicCounts: number[];
  instrument: Except<Instrument, "noiseBands">;
  noteCount: number;
  releaseCount: number;
  releaseResidual: number;
}

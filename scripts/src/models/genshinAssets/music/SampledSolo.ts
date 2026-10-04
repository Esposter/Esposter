import type { LaggedAgreement } from "#src/models/genshinParity/music/LaggedAgreement";

// One render of a voice's notes alone, scored against the pitch classes the notes name, and for a recorded instrument
// The median over the notes of how many seconds its recording runs before its sound starts and how many semitones the
// Note is shifted from it
export interface SampledSolo extends LaggedAgreement {
  name: string;
  onset: number;
  shift: number;
}

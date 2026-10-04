import type { CataloguedInstrument } from "#src/models/genshinAssets/CataloguedInstrument";

// A recorded instrument a voice may take, with the voice's notes rendered through it at level 1 and that render's
// Band energies over the frames the score reads, a band after another
export interface SampledCandidate {
  energies: Float64Array;
  instrument: CataloguedInstrument;
  rendered: Float32Array;
}

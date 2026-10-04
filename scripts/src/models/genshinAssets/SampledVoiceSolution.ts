import type { CataloguedInstrument } from "#src/models/genshinAssets/CataloguedInstrument";

// One instrument for each voice of a source and the level each plays at, a note of velocity 1 scaling its recording by
// That level, with the listening score's band distance their mix lies from the game's sound
export interface SampledVoiceSolution {
  distance: number;
  instruments: CataloguedInstrument[];
  levels: number[];
}

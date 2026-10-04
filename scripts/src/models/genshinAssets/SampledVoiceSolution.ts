import type { CataloguedInstrument } from "#src/models/genshinAssets/CataloguedInstrument";
import type { MusicScore } from "#src/models/genshinParity/MusicScore";

// One instrument for each voice of a source and the level each plays at, a note of velocity 1 scaling its recording by
// That level, with the listening score of their mix against the game's sound
export interface SampledVoiceSolution {
  instruments: CataloguedInstrument[];
  levels: number[];
  score: MusicScore;
}

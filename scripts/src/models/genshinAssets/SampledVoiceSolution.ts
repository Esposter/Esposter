import type { CataloguedInstrument } from "#src/models/genshinAssets/CataloguedInstrument";
import type { OnsetAgeGaps } from "#src/models/genshinParity/OnsetAgeGaps";
import type { ShapedMusicScore } from "#src/models/genshinParity/ShapedMusicScore";

// One instrument for each voice of a source and the level each plays at, a note of velocity 1 scaling its recording by
// That level, with the listening score of their mix against the game's sound once its expression follows the game's,
// And that shaped mix's gaps by the time since a note began
export interface SampledVoiceSolution {
  instruments: CataloguedInstrument[];
  levels: number[];
  onsetAgeGaps: OnsetAgeGaps[];
  shaped: ShapedMusicScore;
}

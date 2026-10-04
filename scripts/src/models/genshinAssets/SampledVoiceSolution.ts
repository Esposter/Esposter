import type { CataloguedInstrument } from "#src/models/genshinAssets/CataloguedInstrument";
import type { MusicScore } from "#src/models/genshinParity/MusicScore";
import type { OnsetAgeGaps } from "#src/models/genshinParity/OnsetAgeGaps";
import type { ShapedMusicScore } from "#src/models/genshinParity/ShapedMusicScore";

// One instrument for each voice of a source and the level each plays at, a note of velocity 1 scaling its recording by
// That level, with the listening score of their mix against the game's sound, as it stands and once its expression
// Follows the game's, and the shaped mix's gaps by the time since a note began
export interface SampledVoiceSolution {
  instruments: CataloguedInstrument[];
  levels: number[];
  onsetAgeGaps: OnsetAgeGaps[];
  score: MusicScore;
  shaped: ShapedMusicScore;
}

import type { BandLevels } from "#src/models/genshinParity/BandLevels";
import type { MusicExpression } from "#src/models/genshinParity/MusicExpression";
import type { MusicEqualizer } from "#src/models/genshinParity/MusicEqualizer";
import type { MusicScore } from "#src/models/genshinParity/MusicScore";

// A render scored once its expression follows the game's: the expression fitted, the listening score and each band's
// Levels of the render under it, and the bus equaliser fitted over what it leaves
export interface ShapedMusicScore {
  bandLevelsList: BandLevels[];
  expression: MusicExpression;
  equalizer: MusicEqualizer;
  score: MusicScore;
}

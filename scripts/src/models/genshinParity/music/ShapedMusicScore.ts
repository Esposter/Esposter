import type { BandLevels } from "#src/models/genshinParity/music/BandLevels";
import type { MusicExpression } from "#src/models/genshinParity/music/MusicExpression";
import type { MusicScore } from "#src/models/genshinParity/music/MusicScore";

// A render scored once its expression follows the game's: the expression fitted, and the listening score and each band's
// Levels of the render under it
export interface ShapedMusicScore {
  bandLevelsList: BandLevels[];
  expression: MusicExpression;
  score: MusicScore;
}

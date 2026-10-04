import type { ShapedMusicScore } from "#src/models/genshinParity/ShapedMusicScore";

import { applyMusicExpression } from "#src/services/genshinParity/applyMusicExpression";
import { fitMusicExpression } from "#src/services/genshinParity/fitMusicExpression";
import { fitMusicEqualizer } from "#src/services/genshinParity/fitMusicEqualizer";
import { readBandLevels } from "#src/services/genshinParity/readBandLevels";
import { readFrameSeconds } from "#src/services/genshinParity/readFrameSeconds";
import { scoreMusicSegment } from "#src/services/genshinParity/scoreMusicSegment";
import { MUSIC_EXPRESSION_WINDOW_SECONDS } from "genshin-engine";

// A render's expression fitted to the game's over `frames`, the frames a score reads (`fitMusicExpression`), then the
// Render under it scored whole, pitch agreement and all, with the bus equaliser fitted over what the expression leaves:
// The swells first, since a fixed equaliser cannot follow them, and the balance after
export const scoreShapedMusic = (
  ours: Float32Array,
  game: Float32Array,
  sampleRate: number,
  frames: number[],
): ShapedMusicScore => {
  const frameTimes = frames.map((frame) => readFrameSeconds(frame, sampleRate));
  const expression = fitMusicExpression(
    readBandLevels(ours, game, sampleRate, frames),
    frameTimes,
    MUSIC_EXPRESSION_WINDOW_SECONDS,
  );
  const shaped = applyMusicExpression(ours, sampleRate, expression.windowGains, MUSIC_EXPRESSION_WINDOW_SECONDS);
  const bandLevelsList = readBandLevels(shaped, game, sampleRate, frames);
  return {
    bandLevelsList,
    expression,
    equalizer: fitMusicEqualizer(bandLevelsList),
    score: scoreMusicSegment(shaped, game, sampleRate),
  };
};

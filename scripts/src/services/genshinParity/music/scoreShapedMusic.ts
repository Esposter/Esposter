import type { ShapedMusicScore } from "#src/models/genshinParity/music/ShapedMusicScore";

import { applyMusicExpression } from "#src/services/genshinParity/music/applyMusicExpression";
import { fitMusicExpression } from "#src/services/genshinParity/music/fitMusicExpression";
import { readBandLevels } from "#src/services/genshinParity/music/readBandLevels";
import { readFrameSeconds } from "#src/services/genshinParity/music/readFrameSeconds";
import { scoreMusicSegment } from "#src/services/genshinParity/music/scoreMusicSegment";
import { MUSIC_EXPRESSION_WINDOW_SECONDS } from "genshin-engine";

// A render's expression fitted to the game's over `frames`, the frames a score reads (`fitMusicExpression`), then the
// Render under it scored whole, pitch agreement and all, as it would sound once that expression shipped with it
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
  return {
    bandLevelsList: readBandLevels(shaped, game, sampleRate, frames),
    expression,
    score: scoreMusicSegment(shaped, game, sampleRate),
  };
};

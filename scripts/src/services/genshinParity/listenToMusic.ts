import type { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import type { MusicScore } from "#src/models/genshinParity/MusicScore";
import type { ShapedMusicScore } from "#src/models/genshinParity/ShapedMusicScore";

import { computeChroma } from "#src/services/genshinParity/computeChroma";
import { LISTEN_SAMPLE_RATE } from "#src/services/genshinParity/constants";
import { readAudibleFrames } from "#src/services/genshinParity/readAudibleFrames";
import { renderMusicSegments } from "#src/services/genshinParity/renderMusicSegments";
import { scoreMusicSegment } from "#src/services/genshinParity/scoreMusicSegment";
import { scoreShapedMusic } from "#src/services/genshinParity/scoreShapedMusic";

// Each segment of a component's music that plays anything, our render scored against the game's, and again once its
// Expression follows the game's with the bus equaliser that would then bring it nearest
export const listenToMusic = async (
  component: DerivedAssetComponent,
  screen: string,
): Promise<{ id: number; score: MusicScore; shaped: ShapedMusicScore }[]> =>
  (await renderMusicSegments(component, screen)).map(({ game, id, ours }) => ({
    id,
    score: scoreMusicSegment(ours, game, LISTEN_SAMPLE_RATE),
    shaped: scoreShapedMusic(
      ours,
      game,
      LISTEN_SAMPLE_RATE,
      readAudibleFrames(computeChroma(game, LISTEN_SAMPLE_RATE).loudness),
    ),
  }));

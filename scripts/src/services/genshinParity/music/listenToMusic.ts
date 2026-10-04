import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { MusicScore } from "#src/models/genshinParity/music/MusicScore";

import { renderMusicSegments } from "#src/services/genshinParity/music/renderMusicSegments";
import { scoreMusicSegment } from "#src/services/genshinParity/music/scoreMusicSegment";
import { LISTEN_SAMPLE_RATE } from "#src/services/genshinParity/shared/constants";

// Each segment of a component's music that plays anything, our render scored against the game's
export const listenToMusic = async (
  component: DerivedAssetComponent,
  screen: string,
): Promise<{ id: number; score: MusicScore }[]> =>
  (await renderMusicSegments(component, screen)).map(({ game, id, ours }) => ({
    id,
    score: scoreMusicSegment(ours, game, LISTEN_SAMPLE_RATE),
  }));

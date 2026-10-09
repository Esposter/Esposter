import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { MusicVoice } from "genshin-engine";

import { readGameMusicSegments } from "#src/services/genshinParity/music/readGameMusicSegments";
import { renderMusicOnPage } from "#src/services/genshinParity/music/renderMusicOnPage";
import { MUSIC_PAGE_SIZE } from "#src/services/genshinParity/shared/constants";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { withFinalizerAsync } from "@esposter/shared";

// Each segment of a component's music that plays anything, our render beside the game's at `LISTEN_SAMPLE_RATE`: ours
// Rendered offline on the parity page by the screen that plays it, through the notes and instruments the screen ships,
// And the game's laid out from its exported sources as the playlist's clips play them (`readGameMusicSegments`). With
// `isLayered` false ours is the synthesizer alone, without the recordings its voices play over it, and a segment
// `segmentVoicesMap` holds plays those voices in place of its own
export const renderMusicSegments = async (
  component: DerivedAssetComponent,
  screen: string,
  isLayered = true,
  segmentVoicesMap: ReadonlyMap<number, MusicVoice[]> = new Map(),
): Promise<{ game: Float32Array; id: number; index: number; ours: Float32Array }[]> => {
  const games = await readGameMusicSegments(component);
  const { close, page } = await openParityPage({ height: MUSIC_PAGE_SIZE, screen, width: MUSIC_PAGE_SIZE });
  return withFinalizerAsync(
    async () => {
      const renders: { game: Float32Array; id: number; index: number; ours: Float32Array }[] = [];
      for (const { game, id, index } of games) {
        // oxlint-disable-next-line no-await-in-loop -- the page renders one segment at a time
        const ours = await renderMusicOnPage(page, index, isLayered, segmentVoicesMap.get(index));
        renders.push({ game, id, index, ours });
      }
      return renders;
    },
    () => close(),
  );
};

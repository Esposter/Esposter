import type { ComponentPlaylist } from "#src/models/genshinAssets/shared/ComponentPlaylist";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { MusicVoice } from "genshin-engine";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readGameMusicSegment } from "#src/services/genshinParity/music/readGameMusicSegment";
import { LISTEN_SAMPLE_RATE } from "#src/services/genshinParity/shared/constants";
import { openParityPage } from "#src/services/genshinParity/shared/openParityPage";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { withFinalizerAsync } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The size the parity page is opened at, which draws nothing for music
const PAGE_SIZE = 360;
// Each segment of a component's music that plays anything, our render beside the game's at `LISTEN_SAMPLE_RATE`: ours
// Rendered offline on the parity page by the screen that plays it, through the notes and instruments the screen ships,
// And the game's laid out from its exported sources as the playlist's clips play them (`readGameMusicSegment`). With
// `isLayered` false ours is the synthesizer alone, without the recordings its voices play over it, and a segment
// `segmentVoicesMap` holds plays those voices in place of its own
export const renderMusicSegments = async (
  component: DerivedAssetComponent,
  screen: string,
  isLayered = true,
  segmentVoicesMap: ReadonlyMap<number, MusicVoice[]> = new Map(),
): Promise<{ game: Float32Array; id: number; index: number; ours: Float32Array }[]> => {
  const { music } = getComponentDirectory(component);
  const { segments } = parseMachineJson<ComponentPlaylist>(await readFile(join(music, "playlist.json"), "utf8"));
  const { browser, page } = await openParityPage({ height: PAGE_SIZE, screen, width: PAGE_SIZE });
  return withFinalizerAsync(
    async () => {
      const renders: { game: Float32Array; id: number; index: number; ours: Float32Array }[] = [];
      for (const [index, segment] of segments.entries()) {
        if (segment.clips.length === 0) continue;
        // oxlint-disable-next-line no-await-in-loop -- the page renders one segment at a time
        const game = await readGameMusicSegment(music, segment, LISTEN_SAMPLE_RATE);
        // oxlint-disable-next-line no-await-in-loop -- as above
        const rendered = await page.evaluate(
          ([segmentIndex, sampleRate, isSegmentLayered, voices]) =>
            (
              Reflect.get(window, "renderMusic") as (
                segmentIndex: number,
                sampleRate: number,
                isLayered: boolean,
                voices?: MusicVoice[],
              ) => Promise<string>
            )(segmentIndex, sampleRate, isSegmentLayered, voices),
          [index, LISTEN_SAMPLE_RATE, isLayered, segmentVoicesMap.get(index)] as const,
        );
        const bytes = Buffer.from(rendered, "base64");
        const ours = new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
        renders.push({ game, id: segment.id, index, ours });
      }
      return renders;
    },
    () => browser.close(),
  );
};

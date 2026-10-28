import type { ComponentPlaylist } from "#src/models/genshinAssets/shared/ComponentPlaylist";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readGameMusicSegment } from "#src/services/genshinParity/music/readGameMusicSegment";
import { LISTEN_SAMPLE_RATE } from "#src/services/genshinParity/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { settleAll } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Segments are read a few at a time, so their sound files decode in parallel without every decoder running at once
const SEGMENT_READ_CONCURRENCY = 4;

// Each segment of a component's music that plays anything, as the game's sound at `LISTEN_SAMPLE_RATE`, with its id and
// Its index in the playlist
export const readGameMusicSegments = async (
  component: DerivedAssetComponent,
): Promise<{ game: Float32Array; id: number; index: number }[]> => {
  const { music } = getComponentDirectory(component);
  const { segments } = parseMachineJson<ComponentPlaylist>(await readFile(join(music, "playlist.json"), "utf8"));
  const segmentReaders: (() => Promise<{ game: Float32Array; id: number; index: number }>)[] = [];
  for (const [index, segment] of segments.entries()) {
    if (segment.clips.length === 0) continue;
    segmentReaders.push(async () => ({
      game: await readGameMusicSegment(music, segment, LISTEN_SAMPLE_RATE),
      id: segment.id,
      index,
    }));
  }
  return settleAll(segmentReaders, SEGMENT_READ_CONCURRENCY);
};

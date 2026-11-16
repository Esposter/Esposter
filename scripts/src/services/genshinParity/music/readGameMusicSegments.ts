import type { ComponentPlaylist } from "#src/models/genshinAssets/shared/ComponentPlaylist";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { GAME_MUSIC_SEGMENT_CONCURRENCY } from "#src/services/genshinParity/music/constants";
import { readGameMusicSegment } from "#src/services/genshinParity/music/readGameMusicSegment";
import { LISTEN_SAMPLE_RATE } from "#src/services/genshinParity/shared/constants";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Each segment of a component's music that plays anything, as the game's sound at `LISTEN_SAMPLE_RATE`, with its id and
// Its index in the playlist, in the playlist's order
export const readGameMusicSegments = async (
  component: DerivedAssetComponent,
): Promise<{ game: Float32Array; id: number; index: number }[]> => {
  const { music } = getComponentDirectory(component);
  const { segments } = parseMachineJson<ComponentPlaylist>(await readFile(join(music, "playlist.json"), "utf8"));
  const playing = [...segments.entries()].filter(([, segment]) => segment.clips.length > 0);
  const games: { game: Float32Array; id: number; index: number }[] = [];
  await forEachConcurrently(playing, GAME_MUSIC_SEGMENT_CONCURRENCY, async ([index, segment]) => {
    const game = await readGameMusicSegment(music, segment, LISTEN_SAMPLE_RATE);
    games.push({ game, id: segment.id, index });
  });
  return games.toSorted((firstSegment, secondSegment) => firstSegment.index - secondSegment.index);
};

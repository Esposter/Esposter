import type { ComponentPlaylist } from "#src/models/genshinAssets/ComponentPlaylist";

import { readAudioSamples } from "#src/services/genshinParity/readAudioSamples";
import { join } from "node:path";

// One segment of a component's music as the game plays it, laid out from its exported sources in the music directory
// As the playlist's clips play them: each source from `playAt` with its trims cut, mixed into the segment's length
export const readGameMusicSegment = async (
  directory: string,
  { clips, duration }: ComponentPlaylist["segments"][number],
  sampleRate: number,
): Promise<Float32Array> => {
  const game = new Float32Array(Math.ceil((duration / 1000) * sampleRate));
  const toSample = (milliseconds: number): number => Math.round((milliseconds / 1000) * sampleRate);
  for (const { beginTrim, duration: sourceDuration, endTrim, playAt, sourceId } of clips) {
    // oxlint-disable-next-line no-await-in-loop -- one source is read at a time
    const source = await readAudioSamples(join(directory, `${sourceId}.wav`), sampleRate);
    for (let sample = toSample(beginTrim); sample < toSample(sourceDuration + endTrim); sample++) {
      const at = toSample(playAt) + sample;
      if (at >= 0 && at < game.length) game[at] = (game[at] ?? 0) + (source[sample] ?? 0);
    }
  }
  return game;
};

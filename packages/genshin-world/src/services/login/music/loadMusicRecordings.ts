import type { Music } from "genshin-engine";

import { DATA_FETCH_TIMEOUT_MS } from "#src/services/constants";
import { readFileResponse } from "#src/services/shared/readFileResponse";

// Every recording a piece's voices play, fetched from `baseUrl` and decoded once, by file. A context decodes at its
// Own rate and a buffer source resamples whatever it plays, so any context the piece plays or renders through can
// Decode them
export const loadMusicRecordings = async (
  context: BaseAudioContext,
  { segments }: Music,
  baseUrl: string,
): Promise<Map<string, AudioBuffer>> => {
  const files = new Set(
    segments.flatMap(({ voices }) => voices.flatMap(({ instrument }) => instrument.recordings.map(({ file }) => file))),
  );
  const entries = await Promise.all(
    Array.from(files, async (file): Promise<[string, AudioBuffer]> => {
      const url = `/${baseUrl}/${file}`;
      const response = await readFileResponse(url, DATA_FETCH_TIMEOUT_MS);
      return [file, await context.decodeAudioData(await response.arrayBuffer())];
    }),
  );
  return new Map(entries);
};

import type { Music } from "genshin-engine";

import { InvalidOperationError, Operation } from "@esposter/shared";

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
    [...files].map(async (file): Promise<[string, AudioBuffer]> => {
      const url = `/${baseUrl}/${file}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
      return [file, await context.decodeAudioData(await response.arrayBuffer())];
    }),
  );
  return new Map(entries);
};

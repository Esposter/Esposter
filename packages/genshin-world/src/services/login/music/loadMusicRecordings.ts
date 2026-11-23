import type { Music } from "genshin-engine";

import { DATA_FETCH_TIMEOUT_MS } from "#src/services/constants";
import { getLoginRecordingUrl } from "#src/services/login/music/getLoginRecordingUrl";
import { readFileResponse } from "@esposter/shared";

// Every recording a piece's voices play, fetched from the hosted game data's lock by file and decoded once. A context
// Decodes at its own rate and a buffer source resamples whatever it plays, so any context the piece plays or renders
// Through can decode them
export const loadMusicRecordings = async (
  context: BaseAudioContext,
  { segments }: Music,
  gameDataBaseUrl: string,
): Promise<Map<string, AudioBuffer>> => {
  const files = new Set(
    segments.flatMap(({ voices }) => voices.flatMap(({ instrument }) => instrument.recordings.map(({ file }) => file))),
  );
  const entries = await Promise.all(
    Array.from(files, async (file): Promise<[string, AudioBuffer]> => {
      const response = await readFileResponse(getLoginRecordingUrl(gameDataBaseUrl, file), DATA_FETCH_TIMEOUT_MS);
      return [file, await context.decodeAudioData(await response.arrayBuffer())];
    }),
  );
  return new Map(entries);
};

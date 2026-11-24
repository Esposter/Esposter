import type { Music } from "genshin-engine";

import { getLoginRecordingUrl } from "#src/services/login/music/getLoginRecordingUrl";
import { readFileResponse } from "@esposter/shared";
import { HOSTED_ASSETS_FETCH_TIMEOUT_MS } from "hosted-assets";

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
      // A hosted object under the hosted budget, as the preload holds it: every recording is read at the login's start,
      // While the packs download on the same link, so the world's ten-second budget would drop the piece's voices
      const response = await readFileResponse(
        getLoginRecordingUrl(gameDataBaseUrl, file),
        HOSTED_ASSETS_FETCH_TIMEOUT_MS,
      );
      return [file, await context.decodeAudioData(await response.arrayBuffer())];
    }),
  );
  return new Map(entries);
};

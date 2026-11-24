import type { Music } from "genshin-engine";

import { getLoginRecordingUrl } from "#src/services/login/music/getLoginRecordingUrl";
import { readHostedAssetFile } from "hosted-assets";

// Every recording a piece's voices play, read by file from the hosted game data's lock through the hosted cache, so the
// Preload finds each one held, and decoded once. A context Decodes at its own rate and a buffer source resamples
// Whatever it plays, so any context the piece plays or renders through can decode them
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
      const blob = await readHostedAssetFile(getLoginRecordingUrl(gameDataBaseUrl, file));
      return [file, await context.decodeAudioData(await blob.arrayBuffer())];
    }),
  );
  return new Map(entries);
};

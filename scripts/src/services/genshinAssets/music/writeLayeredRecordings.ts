import type { SampledVoiceSolution } from "#src/models/genshinAssets/music/SampledVoiceSolution";
import type { Music } from "genshin-engine";

import { encodeMusicRecording } from "#src/services/genshinAssets/music/encodeMusicRecording";
import { fetchSampleFile } from "#src/services/genshinAssets/music/fetchSampleFile";
import { selectShippedRecordings } from "#src/services/genshinAssets/music/selectShippedRecordings";
import { LOGIN_MUSIC_RECORDING_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { roundMusic } from "#src/services/genshinAssets/shared/roundMusic";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";

// Each solved segment's recorded instruments layered into the login's music, one a voice at its solved level, with
// Only the recordings its shipped notes play, and every other voice played by its synthesizer alone. Each recording is
// Encoded once, as far as the furthest-reaching note any voice plays from it reads, into a directory rewritten whole so
// No recording left unplayed stays; the paths written are returned
export const writeLayeredRecordings = async (
  music: Music,
  segmentSolutionMap: ReadonlyMap<number, SampledVoiceSolution>,
): Promise<string[]> => {
  // Each recording to encode by its file name: its library's file, where its sound starts and how far it is read
  const fileRecordingMap = new Map<string, { offset: number; seconds: number; sourcePath: string }>();
  for (const [index, { voices }] of music.segments.entries()) {
    const solution = segmentSolutionMap.get(index);
    if (solution && solution.instruments.length !== voices.length)
      throw new InvalidOperationError(
        Operation.Update,
        `segment ${index}`,
        `${solution.instruments.length} solved instruments for ${voices.length} voices`,
      );
    for (const [voice, { instrument, notes }] of voices.entries()) {
      const cataloguedInstrument = solution?.instruments[voice];
      instrument.recordingLevel = roundMusic(solution?.levels[voice] ?? 0);
      instrument.recordings = [];
      if (!cataloguedInstrument || instrument.recordingLevel === 0) continue;
      const { library, regions } = cataloguedInstrument;
      for (const [region, seconds] of selectShippedRecordings(regions, notes, instrument)) {
        const { gain, highKey, highVelocity, keyCenter, lowKey, lowVelocity, offset, path, tune } = region;
        const file = `${`${library}-${path.replace(/\.\w+$/u, "")}`.toLowerCase().replaceAll(/[^\da-z]+/gu, "-")}.ogg`;
        instrument.recordings.push({ file, gain, highKey, highVelocity, keyCenter, lowKey, lowVelocity, tune });
        // oxlint-disable-next-line no-await-in-loop -- one recording is fetched at a time
        const sourcePath = await fetchSampleFile(library, path);
        fileRecordingMap.set(file, {
          offset,
          seconds: Math.max(fileRecordingMap.get(file)?.seconds ?? 0, seconds),
          sourcePath,
        });
      }
    }
  }
  // Encoded beside the directory and swapped in once every recording is, so a failed encode leaves what ships whole;
  // What ships is set aside rather than removed until the swap lands, and put back if it does not
  const partialDirectory = `${LOGIN_MUSIC_RECORDING_DIRECTORY}.partial`;
  const backupDirectory = `${LOGIN_MUSIC_RECORDING_DIRECTORY}.backup`;
  await rm(partialDirectory, { force: true, recursive: true });
  await mkdir(partialDirectory, { recursive: true });
  for (const [file, { offset, seconds, sourcePath }] of fileRecordingMap)
    // oxlint-disable-next-line no-await-in-loop -- one recording is encoded at a time
    await encodeMusicRecording(sourcePath, offset, roundMusic(seconds), join(partialDirectory, file));
  await rm(backupDirectory, { force: true, recursive: true });
  const isShipped = existsSync(LOGIN_MUSIC_RECORDING_DIRECTORY);
  if (isShipped) await rename(LOGIN_MUSIC_RECORDING_DIRECTORY, backupDirectory);
  const swapResult = await getResultAsync(() => rename(partialDirectory, LOGIN_MUSIC_RECORDING_DIRECTORY));
  await swapResult.match(
    () => rm(backupDirectory, { force: true, recursive: true }),
    async (error) => {
      if (isShipped) await rename(backupDirectory, LOGIN_MUSIC_RECORDING_DIRECTORY);
      throw error;
    },
  );
  return Array.from(fileRecordingMap.keys(), (file) => join(LOGIN_MUSIC_RECORDING_DIRECTORY, file));
};

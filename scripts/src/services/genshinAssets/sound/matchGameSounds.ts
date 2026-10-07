import type { SoundMatch } from "#src/models/genshinAssets/sound/SoundMatch";
import type { SoundSet } from "#src/models/genshinAssets/sound/SoundSet";

import { SOUND_HOP_LENGTH, SOUND_SAMPLE_RATE } from "#src/services/genshinAssets/shared/constants";
import { computeSoundBandPowers } from "#src/services/genshinAssets/sound/computeSoundBandPowers";
import { findSoundStart } from "#src/services/genshinAssets/sound/findSoundStart";
import { fitSoundSets } from "#src/services/genshinAssets/sound/fitSoundSets";
import { readGameSoundBandPowers } from "#src/services/genshinAssets/sound/readGameSoundBandPowers";
import { readAudioSamples } from "#src/services/genshinParity/shared/readAudioSamples";
import { MUSIC_NOISE_BAND_CENTRES } from "genshin-engine";

// How long before the window the level of what already plays (the music, an ambience) is read, to be taken out of it
const BASELINE_SECONDS = 0.25;
// How many of the best scoring sounds are tried together, every set of them, for the one that explains the window best
const SET_CANDIDATE_COUNT = 5;
// Which of the game's sounds a recording plays in a window, and when: every sound of the packages a pattern names is
// Scored against the window by its octave bands' levels at every start (`findSoundStart`), over the bands from the
// Lowest centre named up, the level of what plays before the window taken out of it first. The best few are then
// Played together at their stored levels in every set of them (`fitSoundSets`), and the best set of each size is
// Returned, smallest first, its sounds' offsets from the first of them what `fitSoundEffect` takes
export const matchGameSounds = async (
  recordingPath: string,
  pattern: string,
  fromSeconds: number,
  toSeconds: number,
  lowestCentre: number,
): Promise<{ matches: SoundMatch[]; sets: SoundSet[] }> => {
  const frameSeconds = SOUND_HOP_LENGTH / SOUND_SAMPLE_RATE;
  const [recordingSamples, soundBandPowersMap] = await Promise.all([
    readAudioSamples(recordingPath, SOUND_SAMPLE_RATE),
    readGameSoundBandPowers(pattern, () => true),
  ]);
  const recording = computeSoundBandPowers(recordingSamples);
  const fromFrame = Math.round(fromSeconds / frameSeconds);
  const toFrame = Math.min(Math.round(toSeconds / frameSeconds), recording.length);
  const baselineFrames = recording.slice(
    Math.max(fromFrame - Math.round(BASELINE_SECONDS / frameSeconds), 0),
    fromFrame,
  );
  const baseline = MUSIC_NOISE_BAND_CENTRES.map(
    (_centre, band) =>
      baselineFrames.reduce((sum, bands) => sum + (bands[band] ?? 0), 0) / Math.max(baselineFrames.length, 1),
  );
  const window = recording
    .slice(fromFrame, toFrame)
    .map((bands) => bands.map((power, band) => Math.max(power - (baseline[band] ?? 0), 0)));
  const bands = [...MUSIC_NOISE_BAND_CENTRES.keys()].filter(
    (band) => (MUSIC_NOISE_BAND_CENTRES[band] ?? 0) >= lowestCentre,
  );
  const starts = Array.from(soundBandPowersMap, ([id, powers]) => ({
    id,
    powers,
    ...findSoundStart(window, powers, bands),
  })).toSorted((first, second) => second.score - first.score);
  return {
    matches: starts.map(({ id, powers, score, startFrame }) => ({
      id,
      score,
      seconds: powers.length * frameSeconds,
      startSeconds: (fromFrame + startFrame) * frameSeconds,
    })),
    sets: fitSoundSets(window, starts.slice(0, SET_CANDIDATE_COUNT), bands).map(({ residual, set }) => {
      const firstFrame = Math.min(...set.map(({ startFrame }) => startFrame));
      return {
        residual,
        sounds: set
          .map(({ id, startFrame }) => ({ id, offsetSeconds: (startFrame - firstFrame) * frameSeconds }))
          .toSorted((first, second) => first.offsetSeconds - second.offsetSeconds),
        startSeconds: (fromFrame + firstFrame) * frameSeconds,
      };
    }),
  };
};

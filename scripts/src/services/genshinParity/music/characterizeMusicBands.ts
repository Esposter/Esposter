import type { MusicBandCharacter } from "#src/models/genshinParity/music/MusicBandCharacter";
import type { MusicNote } from "genshin-engine";

import { computeMedianFlatness } from "#src/services/genshinAssets/shared/computeMedianFlatness";
import { computePartialBinRanges } from "#src/services/genshinAssets/shared/computePartialBinRanges";
import { computeSpectrogram } from "#src/services/genshinAssets/shared/computeSpectrogram";
import { computeChroma } from "#src/services/genshinParity/music/computeChroma";
import { getFrameSeconds } from "#src/services/genshinParity/music/getFrameSeconds";
import { computeBandBins } from "#src/services/genshinParity/shared/computeBandBins";
import {
  BANDS_ONSET_RISE,
  CHROMA_FRAME_LENGTH,
  CHROMA_HOP_LENGTH,
  CHROMA_QUIET_SHARE,
  LISTEN_BAND_CENTRES,
} from "#src/services/genshinParity/shared/constants";

const sum = (values: Iterable<number>): number => {
  let total = 0;
  for (const value of values) total += value;
  return total;
};
// What each octave band of a sound holds, over the frames `listen` scores, the pitch classes' own: how much of the
// Sound it is, whether it is partials or noise, whether it comes with the attacks, and how much of it lies on a
// Partial of the notes sounding there. A band short in the score whose power lies off every partial holds what no note
// Plays, a sound the transcription missed or noise; one that lies on them is a level or a timbre of the notes. An
// Attack is a frame whose whole power rises by `BANDS_ONSET_RISE` over the last
export const characterizeMusicBands = (
  samples: Float32Array,
  sampleRate: number,
  notes: MusicNote[],
): MusicBandCharacter[] => {
  const spectrogram = computeSpectrogram(samples, sampleRate, CHROMA_FRAME_LENGTH, CHROMA_HOP_LENGTH);
  const { binCount, frameCount, frameLength, magnitudes } = spectrogram;
  const binWidth = sampleRate / frameLength;
  const { loudness } = computeChroma(samples, sampleRate);
  const quiet = Math.max(...loudness) * CHROMA_QUIET_SHARE;
  const loudFrames = [...loudness.keys()].filter((frame) => frame < frameCount && (loudness[frame] ?? 0) >= quiet);
  const readPower = (frame: number, bin: number): number => (magnitudes[frame * binCount + bin] ?? 0) ** 2;
  const totals = Float64Array.from({ length: frameCount }, (_, frame) => {
    let total = 0;
    for (let bin = 0; bin < binCount; bin++) total += readPower(frame, bin);
    return total;
  });
  const checkIsAttack = (frame: number): boolean =>
    (totals[frame] ?? 0) > BANDS_ONSET_RISE * (totals[frame - 1] ?? Infinity);
  // Each loud frame's bins a partial holds of a note sounding at its centre
  const partialMasks = new Map(
    loudFrames.map((frame) => {
      const seconds = getFrameSeconds(frame, sampleRate);
      const mask = new Uint8Array(binCount);
      for (const { duration, pitch, start } of notes)
        if (start <= seconds && start + duration > seconds)
          for (const [low, high] of computePartialBinRanges(pitch, binWidth, binCount)) mask.fill(1, low, high);
      return [frame, mask];
    }),
  );
  const loudTotal = sum(loudFrames.map((frame) => totals[frame] ?? 0));
  return LISTEN_BAND_CENTRES.map((centre) => {
    const [low, high] = computeBandBins(centre, sampleRate, frameLength, binCount);
    const bins = Array.from({ length: high - low + 1 }, (_, index) => low + index);
    const bandPowers = new Map(
      loudFrames.map((frame) => [frame, sum(bins.map((bin) => readPower(frame, bin)))] as const),
    );
    const meanOf = (frames: number[]): number =>
      sum(frames.map((frame) => bandPowers.get(frame) ?? 0)) / Math.max(frames.length, 1);
    const bandTotal = sum(bandPowers.values());
    const partialTotal = sum(
      loudFrames.map((frame) => {
        const mask = partialMasks.get(frame);
        return sum(bins.map((bin) => (mask?.[bin] ? readPower(frame, bin) : 0)));
      }),
    );
    return {
      attackWeight:
        10 *
        Math.log10(
          meanOf(loudFrames.filter((frame) => checkIsAttack(frame))) /
            meanOf(loudFrames.filter((frame) => !checkIsAttack(frame))),
        ),
      flatness: computeMedianFlatness(spectrogram, loudFrames, [low, high]),
      partialShare: bandTotal > 0 ? partialTotal / bandTotal : 0,
      share: 10 * Math.log10(bandTotal / loudTotal),
    };
  });
};

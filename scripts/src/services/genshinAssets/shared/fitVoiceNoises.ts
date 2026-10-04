import type { Spectrogram } from "#src/models/genshinAssets/shared/Spectrogram";
import type { NoteEventTime } from "pitch-transcription/notes";

import {
  MUSIC_NOISE_MIN_BINS,
  MUSIC_NOISE_MIN_FLATNESS,
  MUSIC_NOISE_REFINE_STEPS,
  MUSIC_RELEASE_SECONDS,
} from "#src/services/genshinAssets/shared/constants";
import { readMedian } from "#src/services/genshinAssets/shared/readMedian";
import { readMedianFlatness } from "#src/services/genshinAssets/shared/readMedianFlatness";
import { readPartialBinRanges } from "#src/services/genshinAssets/shared/readPartialBinRanges";
import { readSpectralPeak } from "#src/services/genshinAssets/shared/readSpectralPeak";
import { toFrequency } from "#src/services/genshinAssets/shared/toFrequency";
import { readBandBins } from "#src/services/genshinParity/shared/readBandBins";
import { solveLinearSystem } from "#src/services/genshinParity/shared/solveLinearSystem";
import { MUSIC_NOISE_BAND_CENTRES } from "genshin-engine";

// Each voice's noise in each octave band of `MUSIC_NOISE_BAND_CENTRES`, the noise's standard deviation over its notes'
// Fundamental amplitude, solved over every frame at once. Every note's noise covers every frequency and no note in a
// Piece sounds alone, so no note's noise can be read on its own; instead a frame's noise in a band, from the median of
// Its bins off every partial of every note sounding there (a frame with too few such bins says nothing of the band:
// The lowest band, a few bins wide, is read between its notes),
// Is the sum over the voices of each one's share times the power of its fundamentals sounding there, and the voices
// Are told apart by how their mix moves from frame to frame. Each band's shares are solved by least squares, a voice
// Given a negative share left silent and the rest solved again, then refined by Gauss-Newton on the logarithm of each
// Frame's power, so a gap is charged in decibels as the listening score charges it and a loud attack does not
// Outweigh the frames between. A Hann window's bin of white noise is Rayleigh, its median √(ln 2 · Σw²) times the
// Deviation, a band's share of white noise its width over the half rate, and a sinusoid's peak A N / 4. Only a band
// The game's sound is noise-like in, its median flatness at least `MUSIC_NOISE_MIN_FLATNESS`, is given noise; each
// Band's flatness is handed back with the levels for the fit's report
export const fitVoiceNoises = (
  spectrogram: Spectrogram,
  voices: NoteEventTime[][],
): { flatnesses: number[]; levels: number[][] } => {
  const { binCount, frameCount, frameLength, hopLength, magnitudes, sampleRate } = spectrogram;
  const binWidth = sampleRate / frameLength;
  // A Hann window's sum of squares is three eighths of its length
  const medianShare = Math.sqrt(Math.LN2 * ((3 * frameLength) / 8));
  // The frames whose windows reach into a note, from the first that holds its start to the last that holds its ring
  // After its end, which its partials and its noise both carry through its release
  const readNoteFrames = ({ durationSeconds, startTimeSeconds }: NoteEventTime): [number, number] => [
    Math.max(Math.floor((startTimeSeconds * sampleRate - frameLength) / hopLength) + 1, 0),
    Math.min(
      Math.floor(((startTimeSeconds + durationSeconds + MUSIC_RELEASE_SECONDS) * sampleRate) / hopLength),
      frameCount - 1,
    ),
  ];
  // Each frame's bins a partial holds of a note its window reaches, of any voice; the median leaves out the few
  // Partials a fixed clearance misses
  const partialMasks = Array.from({ length: frameCount }, () => new Uint8Array(binCount));
  for (const note of voices.flat()) {
    const [firstFrame, lastFrame] = readNoteFrames(note);
    for (const [low, high] of readPartialBinRanges(note.pitchMidi, binWidth, binCount))
      for (let frame = firstFrame; frame <= lastFrame; frame++) partialMasks[frame]?.fill(1, low, high);
  }
  const voicePowers = voices.map((notes) => {
    const powers = new Float64Array(frameCount);
    for (const note of notes) {
      const { pitchMidi } = note;
      const [firstFrame, lastFrame] = readNoteFrames(note);
      for (let frame = firstFrame; frame <= lastFrame; frame++)
        powers[frame] =
          (powers[frame] ?? 0) +
          ((4 * readSpectralPeak(spectrogram, frame, toFrequency(pitchMidi)).magnitude) / frameLength) ** 2;
    }
    return powers;
  });
  const readPower = (voice: number, frame: number): number => voicePowers[voice]?.[frame] ?? 0;
  // The normal equations over the active voices, each frame's row and target given, a frame without a target left out
  const solveNormal = (
    active: number[],
    readRow: (index: number, frame: number) => number,
    readTarget: (frame: number) => number | undefined,
  ): number[] | undefined => {
    const frames = Array.from({ length: frameCount }, (_, frame) => frame).filter(
      (frame) => readTarget(frame) !== undefined,
    );
    const rows = [...active.keys()];
    return solveLinearSystem(
      rows.map((row) =>
        rows.map((column) => frames.reduce((sum, frame) => sum + readRow(row, frame) * readRow(column, frame), 0)),
      ),
      rows.map((row) => frames.reduce((sum, frame) => sum + readRow(row, frame) * (readTarget(frame) ?? 0), 0)),
    );
  };
  const soundingFrames = Array.from({ length: frameCount }, (_, frame) => frame).filter((frame) =>
    voicePowers.some((powers) => (powers[frame] ?? 0) > 0),
  );
  const bands = MUSIC_NOISE_BAND_CENTRES.map((centre) => {
    const [low, high] = readBandBins(centre, sampleRate, frameLength, binCount);
    const flatness = readMedianFlatness(spectrogram, soundingFrames, [low, high]);
    // A band a few partials hold is tones, which what lies off ours is too (an untranscribed line, a partial's ring),
    // And noise there would only blur the pitch
    if (flatness < MUSIC_NOISE_MIN_FLATNESS) return { flatness, levels: voices.map(() => 0) };
    // The band's width over the half rate, the share of white noise's power it holds
    const bandShare = centre / Math.SQRT2 / (sampleRate / 2);
    const noisePowers = Array.from({ length: frameCount }, (_, frame): number | undefined => {
      const offBins: number[] = [];
      for (let bin = low; bin <= high; bin++)
        if (!partialMasks[frame]?.[bin]) offBins.push(magnitudes[frame * binCount + bin] ?? 0);
      if (offBins.length < MUSIC_NOISE_MIN_BINS) return undefined;
      const power = (readMedian(offBins) / medianShare) ** 2 * bandShare;
      return power > 0 ? power : undefined;
    });
    // A voice silent in every frame the band is read in says nothing of it
    let active = voices
      .map((_, index) => index)
      .filter((voice) => noisePowers.some((power, frame) => power !== undefined && readPower(voice, frame) > 0));
    let shares: number[] = [];
    while (active.length > 0) {
      const solving = active;
      const solvingShares =
        solveNormal(
          solving,
          (index, frame) => readPower(solving[index] ?? 0, frame),
          (frame) => noisePowers[frame],
        ) ?? solving.map(() => 0);
      shares = solvingShares;
      if (solvingShares.every((share) => share > 0)) break;
      active = solving.filter((_, index) => (solvingShares[index] ?? 0) > 0);
    }
    // Each share as its logarithm, which keeps it positive through the refinement
    const logShares = shares.map((share) => Math.log(share));
    const solved = active;
    const readModel = (frame: number): number =>
      solved.reduce((sum, voice, index) => sum + Math.exp(logShares[index] ?? 0) * readPower(voice, frame), 0);
    for (let step = 0; step < MUSIC_NOISE_REFINE_STEPS && solved.length > 0; step++) {
      const models = Float64Array.from({ length: frameCount }, (_, frame) => readModel(frame));
      const delta = solveNormal(
        solved,
        (index, frame) =>
          (Math.exp(logShares[index] ?? 0) * readPower(solved[index] ?? 0, frame)) / (models[frame] || 1),
        (frame) => {
          const power = noisePowers[frame];
          return power === undefined || !models[frame] ? undefined : Math.log(power / (models[frame] ?? 1));
        },
      );
      if (!delta) break;
      for (const [index, change] of delta.entries()) logShares[index] = (logShares[index] ?? 0) + change;
    }
    return {
      flatness,
      levels: voices.map((_, voice) => {
        const index = solved.indexOf(voice);
        return index === -1 ? 0 : Math.exp((logShares[index] ?? 0) / 2);
      }),
    };
  });
  return {
    flatnesses: bands.map(({ flatness }) => flatness),
    levels: voices.map((_, voice) => bands.map(({ levels }) => levels[voice] ?? 0)),
  };
};

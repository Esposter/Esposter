import type { Spectrogram } from "#src/models/genshinAssets/Spectrogram";
import type { NoteEventTime } from "pitch-transcription/notes";

import {
  MUSIC_MAX_FREQUENCY,
  MUSIC_NOISE_MIN_FREQUENCY,
  MUSIC_NOISE_REFINE_STEPS,
} from "#src/services/genshinAssets/constants";
import { readMedian } from "#src/services/genshinAssets/readMedian";
import { readSpectralPeak } from "#src/services/genshinAssets/readSpectralPeak";
import { solveLinearSystem } from "#src/services/genshinParity/solveLinearSystem";
import { A4_FREQUENCY, A4_PITCH } from "genshin-engine";

// Each voice's noise, white noise's standard deviation over its notes' fundamental amplitude, solved over every frame
// At once. Every note's noise covers every frequency and no note in a piece sounds alone, so no note's noise can be
// Read on its own; instead a frame's noise power, from its median bin between `MUSIC_NOISE_MIN_FREQUENCY` and
// `MUSIC_MAX_FREQUENCY` (which no partial among them moves), is the sum over the voices of each one's share times the
// Power of its fundamentals sounding there, and the voices are told apart by how their mix moves from frame to frame.
// The shares are solved by least squares, a voice given a negative share left silent and the rest solved again, then
// Refined by Gauss-Newton on the logarithm of each frame's power, so a gap is charged in decibels as the listening score
// Charges it and a loud attack does not outweigh the frames between. A Hann window's bin of noise is Rayleigh, its
// Median √(ln 2 · Σw²) times the deviation, and a sinusoid's peak A N / 4
export const fitVoiceNoises = (spectrogram: Spectrogram, voices: NoteEventTime[][]): number[] => {
  const { binCount, frameCount, frameLength, hopLength, magnitudes, sampleRate } = spectrogram;
  const binWidth = sampleRate / frameLength;
  const lowBin = Math.ceil(MUSIC_NOISE_MIN_FREQUENCY / binWidth);
  const highBin = Math.min(Math.floor(MUSIC_MAX_FREQUENCY / binWidth), binCount - 1);
  // A Hann window's sum of squares is three eighths of its length
  const medianShare = Math.sqrt(Math.LN2 * ((3 * frameLength) / 8));
  const noisePowers = Float64Array.from({ length: frameCount }, (_, frame) => {
    const bins = Array.from(
      { length: highBin - lowBin + 1 },
      (_, index) => magnitudes[frame * binCount + lowBin + index] ?? 0,
    );
    return (readMedian(bins) / medianShare) ** 2;
  });
  const toFrame = (seconds: number): number =>
    Math.min(Math.max(Math.round((seconds * sampleRate - frameLength / 2) / hopLength), 0), frameCount - 1);
  const voicePowers = voices.map((notes) => {
    const powers = new Float64Array(frameCount);
    for (const { durationSeconds, pitchMidi, startTimeSeconds } of notes) {
      const frequency = A4_FREQUENCY * 2 ** ((pitchMidi - A4_PITCH) / 12);
      for (let frame = toFrame(startTimeSeconds); frame <= toFrame(startTimeSeconds + durationSeconds); frame++)
        powers[frame] =
          (powers[frame] ?? 0) + ((4 * readSpectralPeak(spectrogram, frame, frequency).magnitude) / frameLength) ** 2;
    }
    return powers;
  });
  // The normal equations over the active voices, each frame's row weighted and its target given
  const solveNormal = (
    active: number[],
    readRow: (voice: number, frame: number) => number,
    readTarget: (frame: number) => number,
  ): number[] | undefined =>
    solveLinearSystem(
      active.map((row) =>
        active.map((column) => {
          let sum = 0;
          for (let frame = 0; frame < frameCount; frame++) sum += readRow(row, frame) * readRow(column, frame);
          return sum;
        }),
      ),
      active.map((row) => {
        let sum = 0;
        for (let frame = 0; frame < frameCount; frame++) sum += readRow(row, frame) * readTarget(frame);
        return sum;
      }),
    );
  const readPower = (voice: number, frame: number): number => voicePowers[voice]?.[frame] ?? 0;
  let active = voices.map((_, index) => index);
  let shares: number[] = [];
  while (active.length > 0) {
    shares = solveNormal(active, readPower, (frame) => noisePowers[frame] ?? 0) ?? active.map(() => 0);
    if (shares.every((share) => share > 0)) break;
    active = active.filter((_, index) => (shares[index] ?? 0) > 0);
  }
  // Each share as its logarithm, which keeps it positive through the refinement
  const logShares = shares.map((share) => Math.log(share));
  const readModel = (frame: number): number =>
    active.reduce((sum, voice, index) => sum + Math.exp(logShares[index] ?? 0) * readPower(voice, frame), 0);
  // Only a frame with both a note sounding and noise heard has a logarithm to fit
  const isFitted = (frame: number): boolean => readModel(frame) > 0 && (noisePowers[frame] ?? 0) > 0;
  for (let step = 0; step < MUSIC_NOISE_REFINE_STEPS && active.length > 0; step++) {
    const models = Float64Array.from({ length: frameCount }, (_, frame) => readModel(frame));
    const fitted = Uint8Array.from({ length: frameCount }, (_, frame) => (isFitted(frame) ? 1 : 0));
    const delta = solveNormal(
      active.map((_, index) => index),
      (index, frame) =>
        fitted[frame]
          ? (Math.exp(logShares[index] ?? 0) * readPower(active[index] ?? 0, frame)) / (models[frame] ?? 1)
          : 0,
      (frame) => (fitted[frame] ? Math.log((noisePowers[frame] ?? 0) / (models[frame] ?? 1)) : 0),
    );
    if (!delta) break;
    for (const [index, change] of delta.entries()) logShares[index] = (logShares[index] ?? 0) + change;
  }
  return voices.map((_, voice) => {
    const index = active.indexOf(voice);
    return index === -1 ? 0 : Math.exp((logShares[index] ?? 0) / 2);
  });
};

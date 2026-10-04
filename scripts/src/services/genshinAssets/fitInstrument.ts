import type { InstrumentFit } from "#src/models/genshinAssets/InstrumentFit";
import type { Spectrogram } from "#src/models/genshinAssets/Spectrogram";
import type { NoteEventTime } from "pitch-transcription/notes";

import {
  MUSIC_CLEAR_BINS,
  MUSIC_CLEAR_SEMITONES,
  MUSIC_HARMONIC_COUNT,
  MUSIC_MAX_FREQUENCY,
  MUSIC_MIN_MEASUREMENTS,
  MUSIC_NOISE_SHARE,
  MUSIC_RELEASE_SECONDS,
} from "#src/services/genshinAssets/constants";
import { readMedian } from "#src/services/genshinAssets/readMedian";
import { readSpectralPeak } from "#src/services/genshinAssets/readSpectralPeak";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { A4_FREQUENCY, A4_PITCH } from "genshin-engine";

// The decay's time constants tried, in seconds, evenly on a log scale from a frame to half a minute
const DECAY_STEPS = 120;
const MAX_DECAY_SECONDS = 30;
// A voice's instrument fitted to the sound it was heard in, each value measured at the voice's own notes. A note's
// Fundamental and each overtone are read where every other note sounding with it, of any voice, leaves them clear, so
// A crowded passage gives up only the partials it covers, and a note whose peak sits under the noise of the voice's
// Loudest gives up everything. At the fundamental's peak: its amplitude over the note's velocity, its pitch against
// Equal temperament, and each clear overtone over it. The attack is the time from the note's start to that peak, less
// The half window that delays any peak a window reads. The fundamental from its peak to the note's end, as a share of
// The peak, gives the decay's time constant and the level it settles to, the least-squares fit solved exactly for the
// Level at each constant; after the note's end, as a share of its level there, the release's time constant, from the
// Notes nothing sounds over until they have faded into the noise. Every value is the median over the notes, so a few
// Notes a transcription misread move none of them. A window reads a peak low by the share of it the window's mean
// Catches, which the fitted envelope gives, so the level is divided by it, and overtones under the noise are dropped
// From the top
export const fitInstrument = (
  spectrogram: Spectrogram,
  notes: NoteEventTime[],
  soundingNotes: NoteEventTime[],
): InstrumentFit => {
  const { frameCount, frameLength, hopLength, sampleRate } = spectrogram;
  const binWidth = sampleRate / frameLength;
  const frameSeconds = hopLength / sampleRate;
  const halfWindowSeconds = frameLength / 2 / sampleRate;
  // The frame whose window is centred on a time, and the time a frame's window is centred on
  const toFrame = (seconds: number): number =>
    Math.min(Math.max(Math.round((seconds - halfWindowSeconds) / frameSeconds), 0), frameCount - 1);
  const toSeconds = (frame: number): number => frame * frameSeconds + halfWindowSeconds;
  const toFrequency = (pitch: number): number => A4_FREQUENCY * 2 ** ((pitch - A4_PITCH) / 12);
  // Whether a frequency stands clear of every harmonic of every note but one sounding between two times
  const checkIsClear = (frequency: number, note: NoteEventTime, from: number, to: number): boolean => {
    const clearance = Math.max(frequency * (2 ** (MUSIC_CLEAR_SEMITONES / 12) - 1), MUSIC_CLEAR_BINS * binWidth);
    return soundingNotes.every(
      (other) =>
        other === note ||
        other.startTimeSeconds >= to ||
        other.startTimeSeconds + other.durationSeconds <= from ||
        Array.from({ length: MUSIC_HARMONIC_COUNT }, (_, index) => (index + 1) * toFrequency(other.pitchMidi)).every(
          (harmonic) => Math.abs(harmonic - frequency) > clearance,
        ),
    );
  };

  const peaks = notes.flatMap((note) => {
    const fundamental = toFrequency(note.pitchMidi);
    const endSeconds = note.startTimeSeconds + note.durationSeconds;
    if (!checkIsClear(fundamental, note, note.startTimeSeconds, endSeconds)) return [];
    const startFrame = toFrame(note.startTimeSeconds);
    const endFrame = toFrame(endSeconds);
    let peakFrame = startFrame;
    let peak = readSpectralPeak(spectrogram, startFrame, fundamental);
    for (let frame = startFrame + 1; frame <= endFrame; frame++) {
      const reading = readSpectralPeak(spectrogram, frame, fundamental);
      if (reading.magnitude <= peak.magnitude) continue;
      peakFrame = frame;
      peak = reading;
    }
    return [{ endFrame, endSeconds, fundamental, note, peak, peakFrame }];
  });
  const loudest = Math.max(0, ...peaks.map(({ peak }) => peak.magnitude));
  // A note whose peak the source barely holds is the transcription's, or another instrument's, with nothing to measure
  const heard = peaks.filter(({ peak }) => peak.magnitude >= MUSIC_NOISE_SHARE * loudest && peak.magnitude > 0);
  if (heard.length < MUSIC_MIN_MEASUREMENTS)
    throw new InvalidOperationError(Operation.Read, `${heard.length} clear notes`, "too few to fit an instrument by");

  const attacks: number[] = [];
  const levels: number[] = [];
  const tunings: number[] = [];
  const harmonicShares: number[][] = Array.from({ length: MUSIC_HARMONIC_COUNT }, () => []);
  const decayFits: { constant: number; level: number; residual: number }[] = [];
  const releaseFits: { constant: number; residual: number }[] = [];
  for (const { endFrame, endSeconds, fundamental, note, peak, peakFrame } of heard) {
    attacks.push(Math.max(toSeconds(peakFrame) - note.startTimeSeconds - halfWindowSeconds, 0));
    levels.push((4 * peak.magnitude) / frameLength / note.amplitude);
    tunings.push(12 * Math.log2(peak.frequency / fundamental));
    for (let harmonic = 2; harmonic <= MUSIC_HARMONIC_COUNT; harmonic++) {
      const frequency = harmonic * peak.frequency;
      if (frequency > MUSIC_MAX_FREQUENCY || !checkIsClear(frequency, note, note.startTimeSeconds, endSeconds))
        continue;
      harmonicShares[harmonic - 1]?.push(
        readSpectralPeak(spectrogram, peakFrame, frequency).magnitude / peak.magnitude,
      );
    }

    const decaySamples: [number, number][] = [];
    for (let frame = peakFrame; frame <= endFrame; frame++)
      decaySamples.push([
        toSeconds(frame) - toSeconds(peakFrame),
        readSpectralPeak(spectrogram, frame, peak.frequency).magnitude / peak.magnitude,
      ]);
    if (decaySamples.length >= MUSIC_MIN_MEASUREMENTS) {
      // The level settled to, for one decay constant, is the least-squares solution of a line through the samples
      let best = { constant: 0, error: Infinity, level: 0 };
      for (let step = 0; step <= DECAY_STEPS; step++) {
        const constant = frameSeconds * (MAX_DECAY_SECONDS / frameSeconds) ** (step / DECAY_STEPS);
        let numerator = 0;
        let denominator = 0;
        for (const [seconds, share] of decaySamples) {
          const falloff = Math.exp(-seconds / constant);
          numerator += (1 - falloff) * (share - falloff);
          denominator += (1 - falloff) ** 2;
        }
        const level = denominator > 0 ? Math.min(Math.max(numerator / denominator, 0), 1) : 0;
        const error = decaySamples.reduce(
          (sum, [seconds, share]) => sum + (level + (1 - level) * Math.exp(-seconds / constant) - share) ** 2,
          0,
        );
        if (error < best.error) best = { constant, error, level };
      }
      decayFits.push({
        constant: best.constant,
        level: best.level,
        residual: Math.sqrt(best.error / decaySamples.length),
      });
    }

    if (!checkIsClear(fundamental, note, endSeconds, endSeconds + MUSIC_RELEASE_SECONDS)) continue;
    const endLevel = readSpectralPeak(spectrogram, endFrame, peak.frequency).magnitude;
    if (endLevel < MUSIC_NOISE_SHARE * peak.magnitude) continue;
    const releaseSamples: [number, number][] = [];
    const lastFrame = toFrame(endSeconds + MUSIC_RELEASE_SECONDS);
    for (let frame = endFrame + 1; frame <= lastFrame; frame++) {
      const { magnitude } = readSpectralPeak(spectrogram, frame, peak.frequency);
      if (magnitude < MUSIC_NOISE_SHARE * peak.magnitude) break;
      releaseSamples.push([toSeconds(frame) - toSeconds(endFrame), magnitude / endLevel]);
    }
    if (releaseSamples.length < MUSIC_MIN_MEASUREMENTS) continue;
    // The release's constant is the least-squares slope of the log share through the origin
    let slopeNumerator = 0;
    let slopeDenominator = 0;
    for (const [seconds, share] of releaseSamples) {
      slopeNumerator += seconds ** 2;
      slopeDenominator -= seconds * Math.log(share);
    }
    if (slopeDenominator <= 0) continue;
    const constant = slopeNumerator / slopeDenominator;
    const error = releaseSamples.reduce(
      (sum, [seconds, share]) => sum + (Math.exp(-seconds / constant) - share) ** 2,
      0,
    );
    releaseFits.push({ constant, residual: Math.sqrt(error / releaseSamples.length) });
  }

  const harmonicCounts = harmonicShares.map((shares, index) => (index === 0 ? heard.length : shares.length));
  const harmonics = harmonicShares.map((shares, index) =>
    index === 0 ? 1 : shares.length >= MUSIC_MIN_MEASUREMENTS ? readMedian(shares) : 0,
  );
  while (harmonics.length > 1 && (harmonics.at(-1) ?? 0) < MUSIC_NOISE_SHARE) harmonics.pop();
  const attack = readMedian(attacks);
  const decay = decayFits.length > 0 ? readMedian(decayFits.map(({ constant }) => constant)) : MAX_DECAY_SECONDS;
  const sustain = decayFits.length > 0 ? readMedian(decayFits.map(({ level }) => level)) : 1;
  // A window reads the mean of the amplitude it spans, weighted by its own shape, so a peak a fast decay follows reads
  // Low: the fitted envelope's own highest windowed mean is the share of the true peak every reading caught
  const readEnvelope = (seconds: number): number =>
    seconds < 0
      ? 0
      : seconds < attack
        ? seconds / attack
        : sustain + (1 - sustain) * Math.exp(-(seconds - attack) / decay);
  const window = Array.from(
    { length: frameLength },
    (_, index) => 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / frameLength),
  );
  const windowSum = window.reduce((sum, weight) => sum + weight, 0);
  let caughtShare = 0;
  for (let centre = 0; centre <= attack + halfWindowSeconds; centre += frameSeconds)
    caughtShare = Math.max(
      caughtShare,
      window.reduce(
        (sum, weight, index) => sum + weight * readEnvelope(centre + (index - frameLength / 2) / sampleRate),
        0,
      ) / windowSum,
    );
  return {
    decayResidual: decayFits.length > 0 ? readMedian(decayFits.map(({ residual }) => residual)) : 0,
    harmonicCounts,
    instrument: {
      attack,
      decay,
      harmonics,
      level: readMedian(levels) / caughtShare,
      release: releaseFits.length > 0 ? readMedian(releaseFits.map(({ constant }) => constant)) : frameSeconds,
      sustain,
      tuning: readMedian(tunings),
    },
    noteCount: heard.length,
    releaseCount: releaseFits.length,
    releaseResidual: releaseFits.length > 0 ? readMedian(releaseFits.map(({ residual }) => residual)) : 0,
  };
};

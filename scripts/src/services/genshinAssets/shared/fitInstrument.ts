import type { InstrumentFit } from "#src/models/genshinAssets/shared/InstrumentFit";
import type { Spectrogram } from "#src/models/genshinAssets/shared/Spectrogram";
import type { NoteEventTime } from "pitch-transcription/notes";

import {
  MUSIC_CLEAR_BINS,
  MUSIC_CLEAR_SEMITONES,
  MUSIC_COVER_SHARE,
  MUSIC_HARMONIC_COUNT,
  MUSIC_MAX_FREQUENCY,
  MUSIC_MIN_MEASUREMENTS,
  MUSIC_NOISE_SHARE,
  MUSIC_RELEASE_SECONDS,
} from "#src/services/genshinAssets/shared/constants";
import { readMedian } from "#src/services/genshinAssets/shared/readMedian";
import { readSpectralPeak } from "#src/services/genshinAssets/shared/readSpectralPeak";
import { toFrequency } from "#src/services/genshinAssets/shared/toFrequency";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The decay's time constants tried, in seconds, evenly on a log scale from a frame to half a minute
const DECAY_STEPS = 120;
const MAX_DECAY_SECONDS = 30;
// The levels a decay settles to that are tried, evenly from none of the peak to all of it
const SUSTAIN_STEPS = 100;
const toDecibels = (share: number): number => 20 * Math.log10(share);
// A voice's instrument fitted to the sound it was heard in, each value measured at the voice's own notes. A note's
// Fundamental and each overtone are read where every other note sounding with it, of any voice, leaves them clear, so
// A crowded passage gives up only the partials it covers. A partial of another note covers a reading only when
// `readPartialAmplitude` expects it loud enough to move it, so a low note's quiet upper overtones, which crowd closer
// Than a semitone, do not cover everything above them. A note whose peak sits under the noise of the voice's
// Loudest gives up everything. At the fundamental's peak: its amplitude over the note's velocity, its pitch against
// Equal temperament, and each clear overtone over it. The attack is the time from the note's start to that peak, less
// The half window that delays any peak a window reads. The fundamental from its peak to the note's end, as a share of
// The peak, gives the decay's time constant and the level it settles to, fitted to the notes' median share at each
// Frame past the peak; after the note's end, as a share of its level there, the release's time constant, from the
// Notes nothing sounds over until they have faded into the noise. Every value is the median over the notes, so a few
// Notes a transcription misread move none of them. A window reads a peak low by the share of it the window's mean
// Catches, which the fitted envelope gives, so the level is divided by it, and overtones under the noise are dropped
// From the top
export const fitInstrument = (
  spectrogram: Spectrogram,
  notes: NoteEventTime[],
  soundingNotes: NoteEventTime[],
  // The amplitude a sounding note's harmonic (1 for its fundamental) is expected at
  readPartialAmplitude: (note: NoteEventTime, harmonic: number) => number,
): InstrumentFit => {
  const { frameCount, frameLength, hopLength, sampleRate } = spectrogram;
  const binWidth = sampleRate / frameLength;
  const frameSeconds = hopLength / sampleRate;
  const halfWindowSeconds = frameLength / 2 / sampleRate;
  // The frame whose window is centred on a time, and the time a frame's window is centred on
  const toFrame = (seconds: number): number =>
    Math.min(Math.max(Math.round((seconds - halfWindowSeconds) / frameSeconds), 0), frameCount - 1);
  const toSeconds = (frame: number): number => frame * frameSeconds + halfWindowSeconds;
  // A spectral peak's magnitude as the amplitude of the sinusoid it reads
  const toAmplitude = (magnitude: number): number => (4 * magnitude) / frameLength;
  // Whether a reading of an amplitude at a frequency stands clear of every harmonic loud enough to move it of every
  // Note but one sounding between two times
  const checkIsClear = (
    frequency: number,
    amplitude: number,
    note: NoteEventTime,
    from: number,
    to: number,
  ): boolean => {
    const clearance = Math.max(frequency * (2 ** (MUSIC_CLEAR_SEMITONES / 12) - 1), MUSIC_CLEAR_BINS * binWidth);
    return soundingNotes.every(
      (other) =>
        other === note ||
        other.startTimeSeconds >= to ||
        other.startTimeSeconds + other.durationSeconds <= from ||
        Array.from({ length: MUSIC_HARMONIC_COUNT }, (_, index) => index + 1).every(
          (harmonic) =>
            Math.abs(harmonic * toFrequency(other.pitchMidi) - frequency) > clearance ||
            readPartialAmplitude(other, harmonic) < MUSIC_COVER_SHARE * amplitude,
        ),
    );
  };

  const peaks = notes.flatMap((note) => {
    const fundamental = toFrequency(note.pitchMidi);
    const endSeconds = note.startTimeSeconds + note.durationSeconds;
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
    if (!checkIsClear(fundamental, toAmplitude(peak.magnitude), note, note.startTimeSeconds, endSeconds)) return [];
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
  // Each note's fundamental as a share of its peak, by how many frames past the peak it was read
  const decayShares: number[][] = [];
  const releaseFits: { constant: number; residual: number }[] = [];
  for (const { endFrame, endSeconds, fundamental, note, peak, peakFrame } of heard) {
    attacks.push(Math.max(toSeconds(peakFrame) - note.startTimeSeconds - halfWindowSeconds, 0));
    levels.push(toAmplitude(peak.magnitude) / note.amplitude);
    tunings.push(12 * Math.log2(peak.frequency / fundamental));
    for (let harmonic = 2; harmonic <= MUSIC_HARMONIC_COUNT; harmonic++) {
      const frequency = harmonic * peak.frequency;
      if (frequency > MUSIC_MAX_FREQUENCY) break;
      const { magnitude } = readSpectralPeak(spectrogram, peakFrame, frequency);
      if (!checkIsClear(frequency, toAmplitude(magnitude), note, note.startTimeSeconds, endSeconds)) continue;
      harmonicShares[harmonic - 1]?.push(magnitude / peak.magnitude);
    }

    for (let frame = peakFrame; frame <= endFrame; frame++)
      (decayShares[frame - peakFrame] ??= []).push(
        readSpectralPeak(spectrogram, frame, peak.frequency).magnitude / peak.magnitude,
      );

    const endLevel = readSpectralPeak(spectrogram, endFrame, peak.frequency).magnitude;
    if (
      endLevel < MUSIC_NOISE_SHARE * peak.magnitude ||
      !checkIsClear(fundamental, toAmplitude(endLevel), note, endSeconds, endSeconds + MUSIC_RELEASE_SECONDS)
    )
      continue;
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
  // The decay is fitted once, to the notes' median share at each frame past their peaks, wherever enough of them last
  // That long, and in decibels: a note's own few frames cannot tell a slow decay from a fast one onto a level, so a fit
  // A note read every voice as dying about twice as fast as its notes do, and a fit in amplitude is the first frames'
  const decayCurve = decayShares.flatMap((shares, offset) =>
    shares.length >= MUSIC_MIN_MEASUREMENTS
      ? [[offset * frameSeconds, toDecibels(Math.max(readMedian(shares), MUSIC_NOISE_SHARE))] as const]
      : [],
  );
  // Too short a curve fits nothing, and the note is held at its peak
  let decayFit = { constant: MAX_DECAY_SECONDS, error: Infinity, level: 1 };
  if (decayCurve.length >= MUSIC_MIN_MEASUREMENTS)
    for (let step = 0; step <= DECAY_STEPS; step++) {
      const constant = frameSeconds * (MAX_DECAY_SECONDS / frameSeconds) ** (step / DECAY_STEPS);
      for (let levelStep = 0; levelStep <= SUSTAIN_STEPS; levelStep++) {
        const level = levelStep / SUSTAIN_STEPS;
        const error = decayCurve.reduce(
          (sum, [seconds, decibels]) =>
            sum + (toDecibels(level + (1 - level) * Math.exp(-seconds / constant)) - decibels) ** 2,
          0,
        );
        if (error < decayFit.error) decayFit = { constant, error, level };
      }
    }
  const { constant: decay, level: sustain } = decayFit;
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
    decayResidual: Number.isFinite(decayFit.error) ? Math.sqrt(decayFit.error / decayCurve.length) : 0,
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

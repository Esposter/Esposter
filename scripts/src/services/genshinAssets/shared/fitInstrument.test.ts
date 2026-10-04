import { computeSpectrogram } from "#src/services/genshinAssets/shared/computeSpectrogram";
import { MUSIC_FRAME_LENGTH, MUSIC_HOP_LENGTH } from "#src/services/genshinAssets/shared/constants";
import { fitInstrument } from "#src/services/genshinAssets/shared/fitInstrument";
import { A4_FREQUENCY, A4_PITCH } from "genshin-engine";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription/notes";
import { describe, expect, test } from "vitest";

describe(fitInstrument, () => {
  const instrument = {
    attack: 0.02,
    decay: 0.3,
    harmonics: [1, 0.5, 0.25],
    level: 0.2,
    release: 0.15,
    sustain: 0.2,
    tuning: 0.3,
  };
  const velocity = 0.8;
  // Notes a fifth apart, one at a time with silence between, each played as the engine plays it
  const notes = [57, 64, 57, 64, 57].map((pitchMidi, index) => ({
    amplitude: velocity,
    durationSeconds: 1,
    pitchMidi,
    startTimeSeconds: 0.5 + index * 2.5,
  }));
  const samples = new Float32Array(14 * AUDIO_SAMPLE_RATE);
  for (const { durationSeconds, pitchMidi, startTimeSeconds } of notes) {
    const frequency = A4_FREQUENCY * 2 ** ((pitchMidi + instrument.tuning - A4_PITCH) / 12);
    const peak = instrument.level * velocity;
    const readEnvelope = (seconds: number): number =>
      seconds < instrument.attack
        ? (peak * seconds) / instrument.attack
        : peak *
          (instrument.sustain + (1 - instrument.sustain) * Math.exp(-(seconds - instrument.attack) / instrument.decay));
    const endLevel = readEnvelope(durationSeconds);
    for (let index = 0; index < 2 * AUDIO_SAMPLE_RATE; index++) {
      const seconds = index / AUDIO_SAMPLE_RATE;
      const envelope =
        seconds < durationSeconds
          ? readEnvelope(seconds)
          : endLevel * Math.exp(-(seconds - durationSeconds) / instrument.release);
      const wave = instrument.harmonics.reduce(
        (sum, amplitude, harmonic) => sum + amplitude * Math.sin(2 * Math.PI * (harmonic + 1) * frequency * seconds),
        0,
      );
      const sample = Math.round(startTimeSeconds * AUDIO_SAMPLE_RATE) + index;
      samples[sample] = (samples[sample] ?? 0) + envelope * wave;
    }
  }
  const spectrogram = computeSpectrogram(samples, AUDIO_SAMPLE_RATE, MUSIC_FRAME_LENGTH, MUSIC_HOP_LENGTH);

  test("measures back the instrument a note was played on", () => {
    expect.hasAssertions();

    const { instrument: fitted } = fitInstrument(spectrogram, notes, notes, () => Infinity);

    expect(fitted.harmonics).toHaveLength(instrument.harmonics.length);

    for (const [index, amplitude] of fitted.harmonics.entries())
      expect(amplitude).toBeCloseTo(instrument.harmonics[index] ?? 0, 1);

    // Within five cents, about the least a listener tells apart
    expect(fitted.tuning).toBeCloseTo(instrument.tuning, 1);
    expect(fitted.level).toBeCloseTo(instrument.level, 2);
    expect(fitted.attack).toBeCloseTo(instrument.attack, 1);
    expect(fitted.sustain).toBeCloseTo(instrument.sustain, 1);
    expect(fitted.decay / instrument.decay).toBeCloseTo(1, 1);
    expect(fitted.release / instrument.release).toBeCloseTo(1, 1);
  });

  test("counts another note's partial as covering a reading only when it is loud enough to move it", () => {
    expect.hasAssertions();

    // A note two octaves under the lower one, its fourth and sixth harmonics on the two fundamentals, held throughout but
    // Silent
    const bass = { amplitude: velocity, durationSeconds: 14, pitchMidi: 33, startTimeSeconds: 0 };

    expect(() =>
      fitInstrument(spectrogram, notes, [...notes, bass], () => Infinity),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 0 clear notes, too few to fit an instrument by]`,
    );
    expect(
      fitInstrument(spectrogram, notes, [...notes, bass], (note) => (note === bass ? 0 : Infinity)).noteCount,
    ).toBe(notes.length);
  });
});

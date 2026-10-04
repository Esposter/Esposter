import { computeSpectrogram } from "#src/services/genshinAssets/computeSpectrogram";
import { CHROMA_FRAME_LENGTH, CHROMA_HOP_LENGTH } from "#src/services/genshinParity/constants";
import { fitVoiceNoises } from "#src/services/genshinAssets/fitVoiceNoises";
import { A4_FREQUENCY, A4_PITCH, MUSIC_NOISE_BAND_CENTRES } from "genshin-engine";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription/notes";
import { describe, expect, test } from "vitest";

describe(fitVoiceNoises, () => {
  test("tells apart two voices' noise in each band where their notes overlap, a band partials cover or hold left silent", () => {
    expect.hasAssertions();

    const noises = [0.2, 0.05];
    // A low voice of long notes with a rest between, under a high voice of short ones throughout, so the mix moves
    // From frame to frame and the low bands lie clear of every partial once the first low note has rung out
    const voices = [
      [45, 47].map((pitchMidi, index) => ({
        amplitude: 1,
        durationSeconds: 1.5,
        pitchMidi,
        startTimeSeconds: index * 3.5,
      })),
      [69, 72, 74, 76, 69, 72, 74, 76, 69, 72].map((pitchMidi, index) => ({
        amplitude: 0.5 + (index % 3) * 0.5,
        durationSeconds: 0.5,
        pitchMidi,
        startTimeSeconds: index * 0.5,
      })),
    ];
    const samples = new Float32Array(5 * AUDIO_SAMPLE_RATE);
    for (const [voice, notes] of voices.entries())
      for (const { amplitude, durationSeconds, pitchMidi, startTimeSeconds } of notes) {
        const frequency = A4_FREQUENCY * 2 ** ((pitchMidi - A4_PITCH) / 12);
        for (let index = 0; index < durationSeconds * AUDIO_SAMPLE_RATE; index++) {
          const sample = Math.round(startTimeSeconds * AUDIO_SAMPLE_RATE) + index;
          const hash = Math.sin(sample * 12.9898 + voice * 78.233) * 43_758.5453;
          const noise = Math.sqrt(3) * (2 * (hash - Math.floor(hash)) - 1);
          samples[sample] =
            (samples[sample] ?? 0) +
            amplitude *
              (Math.sin((2 * Math.PI * frequency * index) / AUDIO_SAMPLE_RATE) + (noises[voice] ?? 0) * noise);
        }
      }
    const spectrogram = computeSpectrogram(samples, AUDIO_SAMPLE_RATE, CHROMA_FRAME_LENGTH, CHROMA_HOP_LENGTH);
    // White noise holds each band's width over the half rate of its power; the top band, cut by the half rate, is left
    // Out. Each band reads 1 when it is within 4 dB of the truth, the few bins of a low band being the loosest, and 0
    // When the solve leaves it silent: the two the notes' fundamentals hold, which are tonal
    const readings = fitVoiceNoises(spectrogram, voices).levels.map((levels, voice) =>
      MUSIC_NOISE_BAND_CENTRES.slice(0, -1).map((centre, band) => {
        const level = levels[band] ?? 0;
        if (level === 0) return 0;
        const truth = (noises[voice] ?? 1) * Math.sqrt(centre / Math.SQRT2 / (AUDIO_SAMPLE_RATE / 2));
        return Math.abs(20 * Math.log10(level / truth)) < 4 ? 1 : level / truth;
      }),
    );

    expect(readings).toStrictEqual([
      [1, 0, 1, 0, 1, 1, 1],
      [1, 0, 1, 0, 1, 1, 1],
    ]);
  });
});

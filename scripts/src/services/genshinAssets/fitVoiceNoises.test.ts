import { computeSpectrogram } from "#src/services/genshinAssets/computeSpectrogram";
import { MUSIC_FRAME_LENGTH, MUSIC_HOP_LENGTH } from "#src/services/genshinAssets/constants";
import { fitVoiceNoises } from "#src/services/genshinAssets/fitVoiceNoises";
import { A4_FREQUENCY, A4_PITCH } from "genshin-engine";
import { AUDIO_SAMPLE_RATE } from "pitch-transcription/notes";
import { describe, expect, test } from "vitest";

describe(fitVoiceNoises, () => {
  test("tells apart two voices' noise where their notes always overlap", () => {
    expect.hasAssertions();

    const noises = [0.05, 0.01];
    // A low voice of long notes under a high voice of short ones, so every frame has both but in a changing mix
    const voices = [
      [45, 47].map((pitchMidi, index) => ({
        amplitude: 1,
        durationSeconds: 2,
        pitchMidi,
        startTimeSeconds: index * 2,
      })),
      [69, 72, 74, 76, 69, 72, 74, 76].map((pitchMidi, index) => ({
        amplitude: 0.5 + (index % 3) * 0.5,
        durationSeconds: 0.5,
        pitchMidi,
        startTimeSeconds: index * 0.5,
      })),
    ];
    const samples = new Float32Array(4 * AUDIO_SAMPLE_RATE);
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
    const spectrogram = computeSpectrogram(samples, AUDIO_SAMPLE_RATE, MUSIC_FRAME_LENGTH, MUSIC_HOP_LENGTH);
    const fitted = fitVoiceNoises(spectrogram, voices);

    for (const [voice, noise] of fitted.entries()) expect(noise / (noises[voice] ?? 1)).toBeCloseTo(1, 1);
  });
});

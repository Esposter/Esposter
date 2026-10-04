import type { SampleRegion } from "#src/models/genshinAssets/SampleRegion";
import type { NoteEventTime } from "pitch-transcription/notes";

import { renderSampledVoice } from "#src/services/genshinAssets/renderSampledVoice";
import { describe, expect, test } from "vitest";

const createNote = (pitchMidi: number): NoteEventTime => ({
  amplitude: 1,
  durationSeconds: 3,
  pitchMidi,
  startTimeSeconds: 1,
});

describe(renderSampledVoice, () => {
  const sampleRate = 1;
  const region: SampleRegion = {
    gain: 0,
    highKey: 127,
    highVelocity: 127,
    keyCenter: 60,
    lowKey: 0,
    lowVelocity: 1,
    offset: 0,
    path: "",
    tune: 0,
  };
  const regionSamplesMap = new Map([[region, Float32Array.of(0, 1, 2, 3, 4, 5, 6)]]);

  test("plays a note at its recording's pitch as recorded, then fades it", () => {
    expect.hasAssertions();

    const output = renderSampledVoice([createNote(60)], [region], regionSamplesMap, 1, 0, sampleRate, 6);

    expect([...output]).toStrictEqual([0, 0, 1, 2, 3, Math.fround(4 * Math.exp(-1))]);
  });

  test("reads a note an octave up twice as fast", () => {
    expect.hasAssertions();

    const output = renderSampledVoice([createNote(72)], [region], regionSamplesMap, 1, 0, sampleRate, 5);

    expect([...output]).toStrictEqual([0, 0, 2, 4, 6]);
  });
});

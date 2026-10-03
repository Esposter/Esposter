import { createNotes } from "#src/services/createNotes";
import { describe, expect, test } from "vitest";

describe(createNotes, () => {
  const frameCount = 40;
  const pitch = 39;
  const createReadings = (isHeld: (frame: number) => boolean, reading: number): number[][] =>
    Array.from({ length: frameCount }, (_, frame) =>
      Array.from({ length: 88 }, (_reading, index) => (index === pitch && isHeld(frame) ? reading : 0)),
    );
  const frames = createReadings((frame) => frame >= 5 && frame < 25, 0.5);

  test("starts a note at an onset peak and holds it while its frame reading lasts", () => {
    expect.hasAssertions();

    const onsets = createReadings((frame) => frame === 5, 1);

    expect(createNotes({ frames, onsets }, { isInferringOnsets: false, isMelodiaTrick: false })).toStrictEqual([
      { amplitude: 0.5, durationFrames: 20, pitchMidi: 60, startFrame: 5 },
    ]);
  });

  test("follows the energy no onset claimed into a note under the melodia trick", () => {
    expect.hasAssertions();

    const onsets = createReadings(() => false, 0);

    expect(createNotes({ frames, onsets }, { isInferringOnsets: false })).toStrictEqual([
      { amplitude: 0.5, durationFrames: 19, pitchMidi: 60, startFrame: 5 },
    ]);
  });

  test("leaves the readings it is handed unchanged under a frequency range", () => {
    expect.hasAssertions();

    const onsets = createReadings((frame) => frame === 5, 1);
    const expectedFrames = structuredClone(frames);
    const expectedOnsets = structuredClone(onsets);
    createNotes({ frames, onsets }, { maxFrequency: 100, minFrequency: 50 });

    expect({ frames, onsets }).toStrictEqual({ frames: expectedFrames, onsets: expectedOnsets });
  });
});

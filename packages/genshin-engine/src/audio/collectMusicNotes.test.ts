import type { ScheduledMusicSegment } from "#src/audio/ScheduledMusicSegment";

import { collectMusicNotes } from "#src/audio/collectMusicNotes";
import { describe, expect, test } from "vitest";

describe(collectMusicNotes, () => {
  const instrument = {
    attack: 0,
    decay: 1,
    harmonics: [1],
    level: 1,
    noiseBands: [],
    release: 1,
    sustain: 1,
    tuning: 0,
  };
  const scheduledSegment: ScheduledMusicSegment = {
    segment: {
      duration: 3,
      expression: [],
      voices: [
        {
          instrument,
          notes: [
            { duration: 1, pitch: 69, start: 0, velocity: 1 },
            { duration: 1, pitch: 69, start: 2, velocity: 1 },
          ],
        },
      ],
    },
    start: 1,
  };

  test("plays each note at its segment's start plus its own", () => {
    expect.hasAssertions();

    expect(collectMusicNotes(scheduledSegment, 0, 10).map(({ time }) => time)).toStrictEqual([1, 3]);
  });

  test("keeps only the notes that start within the range", () => {
    expect.hasAssertions();

    expect(collectMusicNotes(scheduledSegment, 2, 10).map(({ time }) => time)).toStrictEqual([3]);
  });
});

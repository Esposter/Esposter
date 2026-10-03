import type { ModelReadings } from "#src/models/ModelReadings";

import { ANNOTATIONS_FPS, ANNOTATIONS_SEMITONES } from "#src/constants";
import { createNotes } from "#src/services/createNotes";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { takeOne } from "@esposter/shared";
import { describe, test } from "vitest";

// A minute of music and five: note creation runs over every frame, so its cost is read at two lengths
const BENCH_MINUTES = [1, 5];
// Readings shaped as a recording's: a note struck every fifth of a second, each with its onset and a third of a second
// Of energy, and a held note under each with no onset of its own, which only the melodia trick follows
const createReadings = (minutes: number): Pick<ModelReadings, "frames" | "onsets"> => {
  const frameCount = Math.round(minutes * 60 * ANNOTATIONS_FPS);
  const frames = Array.from({ length: frameCount }, () => Array.from({ length: ANNOTATIONS_SEMITONES }, () => 0));
  const onsets = Array.from({ length: frameCount }, () => Array.from({ length: ANNOTATIONS_SEMITONES }, () => 0));
  for (let start = 1, index = 0; start + 30 < frameCount; start += 17, index++) {
    const pitch = 24 + ((index * 7) % 48);
    const heldPitch = (pitch + 5) % ANNOTATIONS_SEMITONES;
    takeOne(onsets, start)[pitch] = 0.9;
    for (let frame = start; frame < start + 30; frame++) {
      const row = takeOne(frames, frame);
      row[pitch] = 0.6;
      row[heldPitch] = 0.4 + (index % 10) / 100;
    }
  }
  return { frames, onsets };
};
// Notes from their onsets alone against the melodia trick on top, which follows every reading no onset claimed. Note
// Creation never changes the readings it reads, so both read one set
describe(createNotes, () => {
  test.for(BENCH_MINUTES)("%i minutes", async (minutes, { bench }) => {
    const readings = createReadings(minutes);
    await bench.compare(
      bench("onsets", () => {
        createNotes(readings, { isMelodiaTrick: false });
      }),
      bench("melodia trick", () => {
        createNotes(readings);
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});

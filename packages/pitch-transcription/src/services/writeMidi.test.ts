import { writeMidi } from "#src/services/writeMidi";
import { Midi } from "@tonejs/midi";
import { describe, expect, test } from "vitest";

describe(writeMidi, () => {
  test("#17 writes a bend as its share of the bend's range, held at its edge", () => {
    expect.hasAssertions();

    const bytes = writeMidi([
      { amplitude: 1, durationSeconds: 1, pitchBends: [3, -9], pitchMidi: 60, startTimeSeconds: 0 },
    ]);
    const { tracks } = new Midi(bytes);

    expect(tracks.flatMap(({ pitchBends }) => pitchBends.map(({ value }) => value))).toStrictEqual([0.5, -1]);
  });
});

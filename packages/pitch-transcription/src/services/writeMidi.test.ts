import type { NoteEventTime } from "#src/models/NoteEventTime";

import { writeMidi } from "#src/services/writeMidi";
import { describe, expect, test } from "vitest";

describe(writeMidi, () => {
  const RICH_NOTES: NoteEventTime[] = [
    { amplitude: 0.37, durationSeconds: 0.4321, pitchBends: [1, 2, 3, -4, 5], pitchMidi: 72, startTimeSeconds: 0.1234 },
    { amplitude: 0.9, durationSeconds: 0.25, pitchMidi: 64, startTimeSeconds: 0.1234 },
    { amplitude: 0, durationSeconds: 0, pitchBends: [100000, -100000], pitchMidi: 40, startTimeSeconds: 0.5 },
    { amplitude: 1, durationSeconds: 2.0005, pitchBends: [-7, 8, 9, 10], pitchMidi: 48, startTimeSeconds: 0.1234 },
    { amplitude: 0.5, durationSeconds: 0.333333, pitchBends: [0, -1, 2], pitchMidi: 60, startTimeSeconds: 3.3333333 },
  ];

  // The bytes these notes must be written as, pinned here so the writer's output cannot drift unseen
  test("writes an empty track's bytes", () => {
    expect.hasAssertions();

    expect(Buffer.from(writeMidi([])).toString("hex")).toBe(
      "4d546864000000060001000201e04d54726b0000000800ff030000ff2f004d54726b0000000b00ff030000c00000ff2f00",
    );
  });

  test("writes one note's bytes", () => {
    expect.hasAssertions();

    expect(
      Buffer.from(writeMidi([{ amplitude: 1, durationSeconds: 1, pitchMidi: 60, startTimeSeconds: 0 }])).toString(
        "hex",
      ),
    ).toBe(
      "4d546864000000060001000201e04d54726b0000000800ff030000ff2f004d54726b0000001400ff030000c00000903c7f8740803c0000ff2f00",
    );
  });

  test.each<[number, string]>([
    [
      0.005,
      "4d546864000000060001000201e04d54726b0000000800ff030000ff2f004d54726b0000001400ff030000c00000903c018740803c0000ff2f00",
    ],
    [
      1.01,
      "4d546864000000060001000201e04d54726b0000000800ff030000ff2f004d54726b0000001400ff030000c00000903c7f8740803c0000ff2f00",
    ],
  ])("#174 a quiet note still sounds and a loud one stays a velocity, amplitude %s", (amplitude, hex) => {
    expect.hasAssertions();

    expect(
      Buffer.from(writeMidi([{ amplitude, durationSeconds: 1, pitchMidi: 60, startTimeSeconds: 0 }])).toString("hex"),
    ).toBe(hex);
  });

  test("#17 writes a bend as its share of the bend's range, held at its edge", () => {
    expect.hasAssertions();

    expect(
      Buffer.from(
        writeMidi([{ amplitude: 1, durationSeconds: 1, pitchBends: [3, -9], pitchMidi: 60, startTimeSeconds: 0 }]),
      ).toString("hex"),
    ).toBe(
      "4d546864000000060001000201e04d54726b0000000800ff030000ff2f004d54726b0000001d00ff030000c00000903c7f00e000608360e000008360803c0000ff2f00",
    );
  });

  test("writes overlapping notes, bends and a zero-length note", () => {
    expect.hasAssertions();

    expect(Buffer.from(writeMidi(RICH_NOTES)).toString("hex")).toBe(
      "4d546864000000060001000201e04d54726b0000000800ff030000ff2f004d54726b0000006f00ff030000c0007690482e009040720090307f00e0554a00e0000053e02b5553e000604a80400009e02b1553e02b751e9028010080280000e07f7f00e000003580480042e07f7f8360e07f7f8360e07f7f835f803000890a903c3f00e000406be02b356ae02b556b803c0000ff2f00",
    );
  });

  test("#25 returns a Uint8Array a browser holds, not a Node Buffer", () => {
    expect.hasAssertions();

    const bytes = writeMidi([{ amplitude: 1, durationSeconds: 1, pitchMidi: 60, startTimeSeconds: 0 }]);

    expect(bytes).toStrictEqual(new Uint8Array(bytes));
  });
});

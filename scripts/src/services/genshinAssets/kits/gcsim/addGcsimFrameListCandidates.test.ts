import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";

import { createRecordingGcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/createRecordingGcsimKitCandidateWriter.test";
import { addGcsimFrameListCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimFrameListCandidates";
import { describe, expect, test } from "vitest";

// A queue call of the attack a literal names, from the file's line, landing at its damage delay
const call = (delay: number, line: number) => ({ attackName: "ai", delay, delayLine: line, file: "cons.go", line });

const createCharacter = (abil: string, calls: ReturnType<typeof call>[]): GcsimCharacter =>
  ({
    attacks: [{ abil, file: "cons.go", fieldLineMap: {}, line: 4, siteLine: 4, variableName: "ai" }],
    queuedAttacks: calls,
  }) as unknown as GcsimCharacter;

describe(addGcsimFrameListCandidates, () => {
  test("gives a frame list the delays of the queue calls its attack's name matches, in the order they land", () => {
    expect.hasAssertions();

    const added = new Map<string, { file: string; line: number; value: unknown }>();
    const gcsim = createCharacter("Boundless Origin (C6)", [call(22, 9), call(20, 8)]);

    addGcsimFrameListCandidates(
      createRecordingGcsimKitCandidateWriter(added),
      gcsim,
      new Set([
        "frames.boundlessOriginHitmarks.0",
        "frames.boundlessOriginHitmarks.1",
        "frames.boundlessOriginHitmarks.length",
      ]),
    );

    expect(Object.fromEntries(added)).toStrictEqual({
      "frames.boundlessOriginHitmarks.0": { file: "cons.go", line: 8, value: 20 },
      "frames.boundlessOriginHitmarks.1": { file: "cons.go", line: 9, value: 22 },
    });
  });

  test("gives a frame list none where its calls do not number as its hits, or two of them land at one delay", () => {
    expect.hasAssertions();

    const added = new Map<string, { file: string; line: number; value: unknown }>();
    const hits = new Set(["frames.icewhirlHitmark.0", "frames.icewhirlHitmark.1", "frames.icewhirlHitmark.2"]);

    addGcsimFrameListCandidates(
      createRecordingGcsimKitCandidateWriter(added),
      createCharacter("Icetide Vortex (Icewhirl)", [call(30, 9), call(40, 8)]),
      hits,
    );
    addGcsimFrameListCandidates(
      createRecordingGcsimKitCandidateWriter(added),
      createCharacter("Icetide Vortex (Icewhirl)", [call(30, 9), call(30, 8), call(40, 7)]),
      hits,
    );

    expect(added.size).toBe(0);
  });
});

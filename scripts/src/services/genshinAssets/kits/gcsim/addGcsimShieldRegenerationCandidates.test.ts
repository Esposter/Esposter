import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";

import { createRecordingGcsimKitCandidateWriter } from "#src/models/genshinAssets/kits/gcsim/createRecordingGcsimKitCandidateWriter.test";
import { addGcsimShieldRegenerationCandidates } from "#src/services/genshinAssets/kits/gcsim/addGcsimShieldRegenerationCandidates";
import { describe, expect, test } from "vitest";

// A character whose burst.go declares the given constants, each on the line and with the value given
const createCharacter = (constants: [name: string, line: number, value: number][]): GcsimCharacter =>
  ({
    constantMap: new Map<string, GoConstant>(
      constants.map(([name, line, value]) => [name, { elementLines: {}, file: "burst.go", line, value }]),
    ),
  }) as unknown as GcsimCharacter;

describe(addGcsimShieldRegenerationCandidates, () => {
  test("gives Radiant Psalter's three shield delays the frames of gcsim's burst.go constants of their names", () => {
    expect.hasAssertions();

    const added = new Map<string, { file: string; line: number; value: unknown }>();

    addGcsimShieldRegenerationCandidates(
      createRecordingGcsimKitCandidateWriter(added),
      createCharacter([
        ["burstShieldInitial", 20, 31],
        ["burstShieldAfterBenisonStack", 21, 31],
        ["burstShieldRegenerated", 22, 26],
      ]),
    );

    expect(Object.fromEntries(added)).toStrictEqual({
      "frames.radiantPsalterShield": { file: "burst.go", line: 20, value: 31 },
      "frames.radiantPsalterShieldAfterBenisonStack": { file: "burst.go", line: 21, value: 31 },
      "frames.radiantPsalterShieldRegenerated": { file: "burst.go", line: 22, value: 26 },
    });
  });

  test("gives Radiant Psalter no shield delay where gcsim declares no constant of its name", () => {
    expect.hasAssertions();

    const added = new Map<string, { file: string; line: number; value: unknown }>();

    addGcsimShieldRegenerationCandidates(
      createRecordingGcsimKitCandidateWriter(added),
      createCharacter([["burstHitmark", 19, 30]]),
    );

    expect(Object.fromEntries(added)).toStrictEqual({});
  });
});

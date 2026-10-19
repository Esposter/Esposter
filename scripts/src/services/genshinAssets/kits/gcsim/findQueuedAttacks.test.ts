import type { GcsimAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimAttack";
import type { GcsimQueuedAttack } from "#src/models/genshinAssets/kits/gcsim/GcsimQueuedAttack";

import { findQueuedAttacks } from "#src/services/genshinAssets/kits/gcsim/findQueuedAttacks";
import { describe, expect, test } from "vitest";

describe(findQueuedAttacks, () => {
  const attackCommon = { fieldLineMap: {}, file: "burst.go", siteLine: 1, variableName: "ai" };
  const queuedAttack: GcsimQueuedAttack = { attackName: "ai", delayLine: 9, file: "burst.go", line: 9 };

  test("keeps the declared attack when the one branch that sets its multiplier may not run", () => {
    expect.hasAssertions();

    const declared: GcsimAttack = { ...attackCommon, line: 1, talentVariable: "burst" };
    const inBranch: GcsimAttack = {
      ...attackCommon,
      branch: { armCount: 1, chain: 0, endLine: 7, index: 0, isExhaustive: false },
      line: 6,
      talentVariable: "burstC2",
    };

    expect(findQueuedAttacks([declared, inBranch], queuedAttack)).toStrictEqual([declared, inBranch]);
  });

  test("gives only the branches' attacks when an else sets the multiplier in every arm", () => {
    expect.hasAssertions();

    const declared: GcsimAttack = { ...attackCommon, line: 1, talentVariable: "burst" };
    const branch = { armCount: 2, chain: 0, endLine: 7, isExhaustive: true };
    const ifAttack: GcsimAttack = {
      ...attackCommon,
      branch: { ...branch, index: 0 },
      line: 3,
      talentVariable: "burstC2",
    };
    const elseAttack: GcsimAttack = {
      ...attackCommon,
      branch: { ...branch, index: 1 },
      line: 5,
      talentVariable: "burstC6",
    };

    expect(findQueuedAttacks([declared, ifAttack, elseAttack], queuedAttack)).toStrictEqual([ifAttack, elseAttack]);
  });
});

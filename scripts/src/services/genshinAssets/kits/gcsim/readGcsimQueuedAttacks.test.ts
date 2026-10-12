import { evaluateGoConstants } from "#src/services/genshinAssets/kits/gcsim/evaluateGoConstants";
import { readGcsimQueuedAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimQueuedAttacks";
import { describe, expect, test } from "vitest";

describe(readGcsimQueuedAttacks, () => {
  test("reads a queue call's attack by the name it passes and its delay from the constants, an inline literal's by its line", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package jean",
          "",
          "const burstStart = 40",
          "",
          "func (c *char) burst() {",
          "\tai := info.AttackInfo{AttackTag: attacks.AttackTagElementalBurst}",
          "\tc.Core.QueueAttackWithSnap(ai, snap, combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 6), burstStart+15)",
          "\tc.Core.QueueAttack(",
          "\t\tinfo.AttackInfo{AttackTag: attacks.AttackTagNormal},",
          "\t\tcombat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 6),",
          "\t\t0,",
          "\t\t30,",
          "\t)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources))).toStrictEqual([
      { attackLine: undefined, attackName: "ai", delay: 55, delayLine: 7, file: "burst.go", line: 7 },
      { attackLine: 9, attackName: undefined, delay: 30, delayLine: 12, file: "burst.go", line: 8 },
    ]);
  });

  test("reads a queue call's delay written in terms of a local, its first number", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "charge.go",
        source: [
          "package neuvillette",
          "",
          "const shortChargeHitmark = 27",
          "",
          "func (c *char) chargeAttackShort() {",
          "\twindup := 0",
          "\tif c.Core.Player.CurrentState() == action.Idle {",
          "\t\twindup = 14",
          "\t}",
          "\tc.Core.QueueAttack(c.chargeAi, ap, shortChargeHitmark+windup, shortChargeHitmark+windup)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([27]);
  });
});

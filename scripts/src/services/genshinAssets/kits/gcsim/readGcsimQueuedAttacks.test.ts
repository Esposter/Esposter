import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
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
      {
        attackLine: undefined,
        attackName: "ai",
        delay: 55,
        delayLine: 7,
        file: "burst.go",
        hitbox: {
          center: GcsimHitboxCenter.Player,
          file: "burst.go",
          line: 7,
          name: "NewCircleHitOnTarget",
          radius: 6,
          shape: GcsimHitboxShape.Circle,
        },
        line: 7,
      },
      {
        attackLine: 9,
        attackName: undefined,
        delay: 30,
        delayLine: 12,
        file: "burst.go",
        hitbox: {
          center: GcsimHitboxCenter.Player,
          file: "burst.go",
          line: 10,
          name: "NewCircleHitOnTarget",
          radius: 6,
          shape: GcsimHitboxShape.Circle,
        },
        line: 8,
      },
    ]);
  });

  test("reads no delay from a local a branch may change, `windup := 0` then `windup = 14` in the branch", () => {
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

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([
      undefined,
    ]);
  });

  test("reads a parameter's delay from each call's argument, and none where a caller's argument is a local a branch may change", () => {
    expect.hasAssertions();

    const source = (callerArguments: string[]) => [
      "package neuvillette",
      "",
      "const shortChargeHitmark = 27",
      "",
      "func (c *char) ChargeAttack(p map[string]int) {",
      ...callerArguments.map((argument) => `\tc.chargeAttackShort(${argument})`),
      "}",
      "",
      "func (c *char) chargeAttackShort(windup int) {",
      "\tc.Core.QueueAttack(c.chargeAi, ap, shortChargeHitmark+windup, shortChargeHitmark+windup)",
      "}",
    ];
    const branchSources = [
      {
        path: "charge.go",
        source: [
          "package neuvillette",
          "",
          "const shortChargeHitmark = 27",
          "",
          "func (c *char) ChargeAttack(p map[string]int) {",
          "\twindup := 0",
          "\tswitch c.Core.Player.CurrentState() {",
          "\tcase action.Idle:",
          "\t\twindup = 14",
          "\t}",
          "\tc.chargeAttackShort(windup)",
          "}",
          "",
          "func (c *char) chargeAttackShort(windup int) {",
          "\tc.Core.QueueAttack(c.chargeAi, ap, shortChargeHitmark+windup, shortChargeHitmark+windup)",
          "}",
        ].join("\n"),
      },
    ];
    const valuesSources = [{ path: "charge.go", source: source(["0", "14"]).join("\n") }];

    expect(
      readGcsimQueuedAttacks(branchSources, evaluateGoConstants(branchSources)).map(({ delay }) => delay),
    ).toStrictEqual([undefined]);
    expect(
      readGcsimQueuedAttacks(valuesSources, evaluateGoConstants(valuesSources)).map(({ delay }) => delay),
    ).toStrictEqual([27, 41]);
  });

  test("reads no delay from a local of another function, which a call never borrows", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package jean",
          "",
          "func (c *char) first() {",
          "\tdelay := 40",
          "\t_ = delay",
          "}",
          "",
          "func (c *char) second() {",
          "\tc.Core.QueueAttack(ai, ap, 0, delay)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([
      undefined,
    ]);
  });

  test("repeats a queue call in a loop of constant bounds once per iteration, its delay with the loop's variable", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package layla",
          "",
          "const (",
          "\tburstStart = 36",
          "\ttravel = 22",
          ")",
          "",
          "func (c *char) burst() {",
          "\tfor delay := burstStart; delay < 12*60+burstStart; delay += 90 {",
          "\t\tc.Core.Tasks.Add(func() {",
          "\t\t\tc.Core.QueueAttack(ai, ap, 56, 56+travel, cb)",
          "\t\t}, delay)",
          "\t}",
          "\tfor step := 0; step < 3; step += 10 {",
          "\t\tc.Core.QueueAttack(ai, ap, 0, step+5, cb)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    const queuedAttacks = readGcsimQueuedAttacks(sources, evaluateGoConstants(sources));

    expect(queuedAttacks.map(({ delay, line }) => [line, delay])).toStrictEqual([
      [11, 114],
      [11, 204],
      [11, 294],
      [11, 384],
      [11, 474],
      [11, 564],
      [11, 654],
      [11, 744],
      [15, 5],
    ]);
  });

  test("adds a Tasks.Add closure's delay to the queue call in its body, once per iteration, with the call's own delay", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package venti",
          "",
          "func (c *char) burst() {",
          "\tfor i := range 3 {",
          "\t\tc.Core.Tasks.Add(func() {",
          "\t\t\tc.Core.QueueAttackWithSnap(ai, snap, ap, 0, cb)",
          "\t\t}, 106+24*i)",
          "\t}",
          "\tc.Core.Tasks.Add(func() {",
          "\t\tc.Core.QueueAttack(ai, ap, 5, 9, cb)",
          "\t}, 40)",
          "}",
        ].join("\n"),
      },
    ];

    const queuedAttacks = readGcsimQueuedAttacks(sources, evaluateGoConstants(sources));

    expect(queuedAttacks.map(({ delay, delayLine, line }) => [line, delayLine, delay])).toStrictEqual([
      [6, 7, 106],
      [6, 7, 130],
      [6, 7, 154],
      [10, 11, 49],
    ]);
  });

  test("reads a queue call's delay written in terms of a local its declaration gives no number, from the constant it is defaulted to", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package layla",
          "",
          "const (",
          "\ttickRelease = 56",
          "\ttickTravel  = 22",
          ")",
          "",
          "func (c *char) burst(p map[string]int) {",
          '\ttravel, ok := p["travel"]',
          "\tif !ok {",
          "\t\ttravel = tickTravel",
          "\t}",
          "\tc.Core.QueueAttack(ai, ap, tickRelease, tickRelease+travel, cb)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([78]);
  });

  test("reads a queue call's delay in terms of a local a branch defaults to a literal, and repeats it in a loop bounded by that local", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          "package aloy",
          "",
          "const (",
          "\tskillRelease = 20",
          ")",
          "",
          "func (c *char) skill(p map[string]int) {",
          '\ttravel, ok := p["travel"]',
          "\tif !ok {",
          "\t\ttravel = 5",
          "\t}",
          '\tbomblets, ok := p["bomblets"]',
          "\tif !ok {",
          "\t\tbomblets = 2",
          "\t}",
          "\tfor i := 0; i < bomblets; i++ {",
          "\t\tc.Core.QueueAttack(ai, ap, skillRelease, skillRelease+travel+((i+1)*6), cb)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay, line }) => [line, delay]),
    ).toStrictEqual([
      [17, 31],
      [17, 37],
    ]);
  });

  test("reads a hexadecimal literal a local is defaulted to as its whole number, `travel = 0x5`", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          "package aloy",
          "",
          "const (",
          "\tskillRelease = 20",
          ")",
          "",
          "func (c *char) skill(p map[string]int) {",
          '\ttravel, ok := p["travel"]',
          "\tif !ok {",
          "\t\ttravel = 0x5",
          "\t}",
          "\tfor i := 0; i < 2; i++ {",
          "\t\tc.Core.QueueAttack(ai, ap, skillRelease, skillRelease+travel+((i+1)*6), cb)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([
      31, 37,
    ]);
  });

  test("repeats a queue call in a loop whose bound is inclusive, `i <= 120`, once per value up to it", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package amber",
          "",
          "const burstStart = 40",
          "",
          "func (c *char) burst() {",
          "\tfor i := 24; i <= 48; i += 24 {",
          "\t\tc.Core.QueueAttackWithSnap(ai, snap, ap, burstStart+i)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([
      64, 88,
    ]);
  });

  test("repeats a queue call in a loop ranging over a constant count, `for i := range 3` and `for range 2`, once per count", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package ayaka",
          "",
          "const burstHitmark = 104",
          "",
          "func (c *char) burst() {",
          "\tfor i := range 3 {",
          "\t\tc.Core.QueueAttack(ai, ap, burstHitmark, burstHitmark+i*15, cb)",
          "\t}",
          "\tfor range 2 {",
          "\t\tc.Core.QueueAttack(aiC2, ap, burstHitmark, burstHitmark, cb)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    const queuedAttacks = readGcsimQueuedAttacks(sources, evaluateGoConstants(sources));

    expect(queuedAttacks.map(({ delay, line }) => [line, delay])).toStrictEqual([
      [7, 104],
      [7, 119],
      [7, 134],
      [10, 104],
      [10, 104],
    ]);
  });

  test("adds a QueueCharTask closure's delay to a call in it, as it does a Tasks.Add closure's", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package flins",
          "",
          "const burstHitmarkInitial = 93",
          "",
          "func (c *char) burst() {",
          "\tai := info.AttackInfo{AttackTag: attacks.AttackTagElementalBurst}",
          "\tc.QueueCharTask(func() {",
          "\t\tc.Core.QueueAttack(ai, ap, 0, 0)",
          "\t}, burstHitmarkInitial)",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay, line }) => [line, delay]),
    ).toStrictEqual([[8, 93]]);
  });
  test("adds a QueueCharTask closure's delay written in a parameter, from its caller's argument", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "charge.go",
        source: [
          "package neuvillette",
          "",
          "const shortChargeHitmark = 27",
          "",
          "func (c *char) ChargeAttack() {",
          "\tc.chargeAttackShort(0)",
          "}",
          "",
          "func (c *char) chargeAttackShort(windup int) {",
          "\tc.QueueCharTask(func() {",
          "\t\tc.Core.QueueAttack(c.chargeAi, ap, shortChargeHitmark+windup, shortChargeHitmark+windup)",
          "\t}, windup+3)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([30]);
  });
});

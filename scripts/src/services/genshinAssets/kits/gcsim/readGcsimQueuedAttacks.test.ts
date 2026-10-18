import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { evaluateGoConstants } from "#src/services/genshinAssets/kits/gcsim/evaluateGoConstants";
import { readGcsimQueuedAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimQueuedAttacks";
import { describe, expect, test } from "vitest";

// The package clause every fixture's Go source opens with, which no reader inspects
const GO_PACKAGE_CLAUSE = "package character";

// A charge source: its caller's calls of the short charge, and the short charge's body, which fires the attack at its windup
const createChargeSource = (
  callerArguments: string[],
  shortBody = ["\tc.Core.QueueAttack(c.chargeAi, ap, shortChargeHitmark+windup, shortChargeHitmark+windup)"],
) => [
  GO_PACKAGE_CLAUSE,
  "",
  "const shortChargeHitmark = 27",
  "",
  "func (c *char) ChargeAttack(p map[string]int) {",
  ...callerArguments.map((argument) => `\tc.chargeAttackShort(${argument})`),
  "}",
  "",
  "func (c *char) chargeAttackShort(windup int) {",
  ...shortBody,
  "}",
];

describe(readGcsimQueuedAttacks, () => {
  test("reads a queue call's attack by the name it passes and its delay from the constants, an inline literal's by its line", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
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

  test("reads a circle on the primary target with a forward offset, the offset its constructor gives", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tc.Core.QueueAttack(",
          "\t\tinfo.AttackInfo{AttackTag: attacks.AttackTagElementalBurst},",
          "\t\tcombat.NewCircleHit(c.Core.Combat.Player(), c.Core.Combat.PrimaryTarget(), info.Point{Y: 1}, 7.5),",
          "\t\t0,",
          "\t\t30,",
          "\t)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources))).toStrictEqual([
      {
        attackLine: 5,
        attackName: undefined,
        delay: 30,
        delayLine: 8,
        file: "burst.go",
        hitbox: {
          center: GcsimHitboxCenter.PrimaryTarget,
          file: "burst.go",
          line: 6,
          name: "NewCircleHit",
          offset: [0, 1],
          radius: 7.5,
          shape: GcsimHitboxShape.Circle,
        },
        line: 4,
      },
    ]);
  });

  test("reads a queue call's single-target hit as a circle of no radius on its primary target", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tai := info.AttackInfo{AttackTag: attacks.AttackTagElementalSkill}",
          "\tc.Core.QueueAttackWithSnap(ai, snap, combat.NewSingleTargetHit(e.Key()), 3)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources))).toStrictEqual([
      {
        attackLine: undefined,
        attackName: "ai",
        delay: 3,
        delayLine: 5,
        file: "burst.go",
        hitbox: {
          center: GcsimHitboxCenter.PrimaryTarget,
          file: "burst.go",
          line: 5,
          name: "NewSingleTargetHit",
          radius: 0,
          shape: GcsimHitboxShape.Circle,
        },
        line: 5,
      },
    ]);
  });

  test("reads a queue call's hitbox from the constructor its local is assigned in the call's own function, at the constructor's line", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "const skillDashHitmark = 11",
          "",
          "func (c *char) skillDashNoBOL(_ map[string]int) {",
          "\tai := info.AttackInfo{AttackTag: attacks.AttackTagNormal}",
          "\tap := combat.NewCircleHitOnTarget(c.Core.Combat.PrimaryTarget(), nil, 0.6)",
          "\tc.Core.QueueAttack(ai, ap, skillDashHitmark, skillDashHitmark, c.particleCB)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources))).toStrictEqual([
      {
        attackLine: undefined,
        attackName: "ai",
        delay: 11,
        delayLine: 8,
        file: "skill.go",
        hitbox: {
          center: GcsimHitboxCenter.PrimaryTarget,
          file: "skill.go",
          line: 7,
          name: "NewCircleHitOnTarget",
          radius: 0.6,
          shape: GcsimHitboxShape.Circle,
        },
        line: 8,
      },
    ]);
  });

  test("reads no hitbox from a local a branch may reassign before the call, where its constructor is no longer the one called", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) skillDash(_ map[string]int) {",
          "\tai := info.AttackInfo{AttackTag: attacks.AttackTagNormal}",
          "\tap := combat.NewCircleHitOnTarget(c.Core.Combat.PrimaryTarget(), nil, 0.6)",
          "\tif c.Base.Cons >= 6 {",
          "\t\tap = combat.NewCircleHitOnTarget(c.Core.Combat.PrimaryTarget(), nil, 0.8)",
          "\t}",
          "\tc.Core.QueueAttack(ai, ap, 11, 11, c.particleCB)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources))).toStrictEqual([
      {
        attackLine: undefined,
        attackName: "ai",
        delay: 11,
        delayLine: 9,
        file: "skill.go",
        hitbox: undefined,
        line: 9,
      },
    ]);
  });

  test("reads no delay from a local a branch may change, `windup := 0` then `windup = 14` in the branch", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "charge.go",
        source: [
          GO_PACKAGE_CLAUSE,
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

  test("reads no loop bound from a local a branch adds to, `dur += 240` in the branch, so its loop is not repeated", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tdur := 510",
          "\tif c.Base.Cons >= 2 {",
          "\t\tdur += 240",
          "\t}",
          "\tfor i := 120; i < dur; i += 120 {",
          "\t\tc.Core.QueueAttack(ai, ap, 0, i)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([
      undefined,
    ]);
  });

  test("repeats a queue call in a loop bounded by a local a constellation branch raises, once per value at the base bound", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tc.QueueCharTask(func() {",
          "\t\tmaxDuration := 10",
          "\t\tif c.Base.Cons >= 4 {",
          "\t\t\tmaxDuration = 14",
          "\t\t}",
          "\t\tfor delay := 0; delay <= maxDuration; delay += 4 {",
          "\t\t\tc.Core.Tasks.Add(func() {",
          "\t\t\t\tc.Core.QueueAttackWithSnap(burstHit, snap, ap, 0)",
          "\t\t\t}, delay)",
          "\t\t}",
          "\t}, 5)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([
      5, 9, 13,
    ]);
  });

  test("repeats a queue call at a constellation in a loop bounded by a local the constellation branch raises, up to that constellation's value", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tc.QueueCharTask(func() {",
          "\t\tmaxDuration := 10",
          "\t\tif c.Base.Cons >= 4 {",
          "\t\t\tmaxDuration = 14",
          "\t\t}",
          "\t\tfor delay := 0; delay <= maxDuration; delay += 4 {",
          "\t\t\tc.Core.Tasks.Add(func() {",
          "\t\t\t\tc.Core.QueueAttackWithSnap(burstHit, snap, ap, 0)",
          "\t\t\t}, delay)",
          "\t\t}",
          "\t}, 5)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources), 4).map(({ delay }) => delay)).toStrictEqual([
      5, 9, 13, 17,
    ]);
  });

  test("reads a parameter's delay from each call's argument, and none where a caller's argument is a local a branch may change", () => {
    expect.hasAssertions();

    const branchSources = [
      {
        path: "charge.go",
        source: [
          GO_PACKAGE_CLAUSE,
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
    const valuesSources = [{ path: "charge.go", source: createChargeSource(["0", "14"]).join("\n") }];

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
          GO_PACKAGE_CLAUSE,
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
          GO_PACKAGE_CLAUSE,
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

  test("reads each iteration's hit from the loop variable in its radius, `2+i` giving 2, 3 and 4", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tfor i := 0; i < 3; i++ {",
          "\t\tc.Core.QueueAttack(ai, combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 2+i), 0, 0)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ hitbox }) => hitbox?.radius),
    ).toStrictEqual([2, 3, 4]);
  });

  test("adds a Tasks.Add closure's delay to the queue call in its body, once per iteration, with the call's own delay", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
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

  test("reads no default from a closure's `ok` local, which a same-named local of the function does not share", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tgetExt := func() int {",
          '\t\text, ok := p["extend"]',
          "\t\tif !ok {",
          "\t\t\text = 0",
          "\t\t}",
          "\t\treturn ext",
          "\t}",
          "\text := getExt()",
          "\tc.Core.QueueAttack(ai, ap, 0, ext*60)",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([
      undefined,
    ]);
  });

  test("reads a queue call's delay written in terms of a local its declaration gives no number, from the constant it is defaulted to", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
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
          GO_PACKAGE_CLAUSE,
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
          GO_PACKAGE_CLAUSE,
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
          GO_PACKAGE_CLAUSE,
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
          GO_PACKAGE_CLAUSE,
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

  test("repeats a queue call in a loop ranging over a constant slice once per element, with the element as its delay", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "var burstHitmarks = []int{112, 112 + 16, 112 + 16 + 12}",
          "",
          "func (c *char) burst() {",
          "\tfor i, delay := range burstHitmarks {",
          "\t\tc.QueueCharTask(func() { c.Core.QueueAttack(aiCopy, ap, 0, 0) }, delay)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    const queuedAttacks = readGcsimQueuedAttacks(sources, evaluateGoConstants(sources));

    expect(queuedAttacks.map(({ attackName, delay, line }) => [attackName, delay, line])).toStrictEqual([
      ["aiCopy", 112, 7],
      ["aiCopy", 128, 7],
      ["aiCopy", 140, 7],
    ]);
  });

  test("gives each call a constant loop repeats the loop's variables as its iterations, the index and element of a slice", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "var burstHitmarks = []int{112, 112 + 16, 112 + 16 + 12}",
          "",
          "func (c *char) burst() {",
          "\tfor i, delay := range burstHitmarks {",
          "\t\tc.QueueCharTask(func() { c.Core.QueueAttack(aiCopy, ap, 0, 0) }, delay)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    const queuedAttacks = readGcsimQueuedAttacks(sources, evaluateGoConstants(sources));

    expect(queuedAttacks.map(({ iterations }) => iterations)).toStrictEqual([
      { delay: 112, i: 0 },
      { delay: 128, i: 1 },
      { delay: 140, i: 2 },
    ]);
  });

  test("adds a QueueCharTask closure's delay to a call in it, as it does a Tasks.Add closure's", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
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
        source: createChargeSource(
          ["0"],
          [
            "\tc.QueueCharTask(func() {",
            "\t\tc.Core.QueueAttack(c.chargeAi, ap, shortChargeHitmark+windup, shortChargeHitmark+windup)",
            "\t}, windup+3)",
          ],
        ).join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([30]);
  });

  test("reads both indexes of a named array a delay takes from a local clamped to 0 and 1 from the action's hold parameter", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "var (",
          "\tskillHitmarks = []int{21, 37}",
          ")",
          "",
          "func (c *char) Skill(p map[string]int) {",
          '\thold := min(max(p["hold"], 0), 1)',
          "\tc.handleSkill(hold)",
          "}",
          "",
          "func (c *char) handleSkill(hold int) {",
          "\tc.Core.Tasks.Add(func() {",
          "\t\tc.Core.QueueAttackWithSnap(ai, snap, combat.NewBoxHitOnTarget(c.Core.Combat.Player(), nil, 5.5, 3.5), 0)",
          "\t}, skillHitmarks[hold])",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay, holdValue, line }) => [
        line,
        delay,
        holdValue,
      ]),
    ).toStrictEqual([
      [14, 21, 0],
      [14, 37, 1],
    ]);
  });

  test("adds the delay of each Tasks.Add closure a method is called from to the queue calls in that method, once per call", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) skill() {",
          "\tc.Core.Tasks.Add(func() {",
          "\t\tc.danceDoubleTicker(0)",
          "\t}, 114)",
          "\tc.Core.Tasks.Add(func() {",
          "\t\tc.danceDoubleTicker(1)",
          "\t}, 40)",
          "}",
          "",
          "func (c *char) danceDoubleTicker(attackType int) {",
          "\tc.Core.QueueAttack(ai, ap, 0, 0)",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay, line }) => [line, delay]),
    ).toStrictEqual([
      [13, 114],
      [13, 40],
    ]);
  });

  test("adds the delays of the Tasks.Add closures a method's call is nested in, outer and inner, to the queue calls in that method", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tc.Core.Tasks.Add(func() {",
          "\t\tc.Core.Tasks.Add(func() {",
          "\t\t\tc.burstTicks(0)",
          "\t\t}, 43)",
          "\t}, 25)",
          "}",
          "",
          "func (c *char) burstTicks(snap int) {",
          "\tc.Core.QueueAttackWithSnap(ai, ap, snap, 0, 0)",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay, line }) => [line, delay]),
    ).toStrictEqual([[12, 68]]);
  });

  test("reads a method's queue call's own delay, 0, and adds none from its call outside any task closure, at its caller's time", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) skill() {",
          "\tc.danceDoubleTicker(0)",
          "}",
          "",
          "func (c *char) danceDoubleTicker(attackType int) {",
          "\tc.Core.QueueAttack(ai, ap, 0, 0)",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay, line }) => [line, delay]),
    ).toStrictEqual([[8, 0]]);
  });

  test("adds the delay a method's call gives it in a Tasks.Add to the queue calls in the closure the method returns", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tc.Core.Tasks.Add(c.burstTick(), 137)",
          "}",
          "",
          "func (c *char) burstTick() func() {",
          "\treturn func() {",
          "\t\tc.Core.QueueAttack(ai, ap, 0, 0)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay, line }) => [line, delay]),
    ).toStrictEqual([[9, 137]]);
  });

  test("reads no repeat of a method's call in its own body, its next tick's delay is the one the body's own call gives", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tc.Core.Tasks.Add(c.tick(), 137)",
          "}",
          "",
          "func (c *char) tick() {",
          "\tc.Core.QueueAttack(ai, ap, 0, 1)",
          "\tc.Core.Tasks.Add(c.tick(), 117)",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay, line }) => [line, delay]),
    ).toStrictEqual([[8, 138]]);
  });

  test("reads a Tasks.Add delay the reader cannot evaluate as the call's own delay alone, as it reads no delay it cannot give", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tc.Core.Tasks.Add(c.burstTick(), ceil(windupDelay))",
          "}",
          "",
          "func (c *char) burstTick() {",
          "\tc.Core.QueueAttack(ai, ap, 0, 1)",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay, line }) => [line, delay]),
    ).toStrictEqual([[8, 1]]);
  });

  test("reads no delay from a closure a function returns whose schedule's delay it cannot read", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) burst() {",
          "\tc.Core.Tasks.Add(c.burstTick(c.burstSrc), ceil(burstFirstTickDelay))",
          "}",
          "",
          "func (c *char) burstTick(src int) func() {",
          "\treturn func() {",
          "\t\tc.Core.QueueAttack(ai, ap, 0, 0)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([
      undefined,
    ]);
  });

  test("reads no delay from a returned closure no Tasks.Add schedules, an attack callback run by its hit", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) c2() info.AttackCBFunc {",
          "\treturn func(a info.AttackCB) {",
          "\t\tc.Core.QueueAttack(ai, ap, 0, 0)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ delay }) => delay)).toStrictEqual([
      undefined,
    ]);
  });

  test("gives a single-target hit fired in a loop over an area query the query's area, at the query's line", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "const skillRadius = 1.5",
          "",
          "func (c *char) skill() {",
          "\tai := info.AttackInfo{AttackTag: attacks.AttackTagElementalArt}",
          "\taoe := combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, skillRadius)",
          "\ttargets := c.Core.Combat.EnemiesWithinArea(aoe, func(t info.Enemy) bool {",
          "\t\treturn true",
          "\t})",
          "\tfor _, t := range targets {",
          "\t\tc.Core.QueueAttack(ai, combat.NewSingleTargetHit(t.Key()), 15, 15)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ hitbox }) => hitbox)).toStrictEqual([
      {
        center: GcsimHitboxCenter.Player,
        file: "skill.go",
        line: 7,
        name: "NewCircleHitOnTarget",
        radius: 1.5,
        shape: GcsimHitboxShape.Circle,
      },
    ]);
  });

  test("keeps a single-target hit's own hitbox in a loop over a random subset of an area, which does not reach every enemy in it", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) skill() {",
          "\tai := info.AttackInfo{AttackTag: attacks.AttackTagElementalArt}",
          "\taoe := combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 1.5)",
          "\tenemies := c.Core.Combat.RandomEnemiesWithinArea(aoe, nil, 2)",
          "\tfor _, e := range enemies {",
          "\t\tc.Core.QueueAttack(ai, combat.NewSingleTargetHit(e.Key()), 15, 15)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ hitbox }) => hitbox)).toStrictEqual([
      {
        center: GcsimHitboxCenter.PrimaryTarget,
        file: "skill.go",
        line: 8,
        name: "NewSingleTargetHit",
        radius: 0,
        shape: GcsimHitboxShape.Circle,
      },
    ]);
  });

  test("keeps a hit's own hitbox in a loop over an area query where the hit is not single-target", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          GO_PACKAGE_CLAUSE,
          "",
          "func (c *char) skill() {",
          "\tai := info.AttackInfo{AttackTag: attacks.AttackTagElementalArt}",
          "\taoe := combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 1.5)",
          "\tfor _, e := range c.Core.Combat.EnemiesWithinArea(aoe, nil) {",
          "\t\tc.Core.QueueAttack(ai, combat.NewCircleHitOnTarget(c.Core.Combat.PrimaryTarget(), nil, 2), 15, 15)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];

    expect(readGcsimQueuedAttacks(sources, evaluateGoConstants(sources)).map(({ hitbox }) => hitbox)).toStrictEqual([
      {
        center: GcsimHitboxCenter.PrimaryTarget,
        file: "skill.go",
        line: 7,
        name: "NewCircleHitOnTarget",
        radius: 2,
        shape: GcsimHitboxShape.Circle,
      },
    ]);
  });
});

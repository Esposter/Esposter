import {
  GCSIM_EMPTY_CONFIG,
  GCSIM_ODETTE_FIXTURE_DIRECTORY,
} from "#src/services/genshinAssets/kits/gcsim/constants.test";
import { evaluateGoConstants } from "#src/services/genshinAssets/kits/gcsim/evaluateGoConstants";
import { findQueuedAttack } from "#src/services/genshinAssets/kits/gcsim/findQueuedAttack";
import { readGcsimAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimAttacks";
import { readGcsimQueuedAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimQueuedAttacks";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(findQueuedAttack, () => {
  test("fires a loop iteration's variant of a copy's attack from the call of that iteration, and the copy from the others", () => {
    expect.hasAssertions();

    const name = "burst.go";
    const sources = [{ path: name, source: readFileSync(join(GCSIM_ODETTE_FIXTURE_DIRECTORY, name), "utf8") }];
    const constantMap = evaluateGoConstants(sources);
    const attacks = readGcsimAttacks(sources, constantMap, GCSIM_EMPTY_CONFIG);
    const queuedAttacks = readGcsimQueuedAttacks(sources, constantMap, GCSIM_EMPTY_CONFIG);

    expect(queuedAttacks.map((queuedAttack) => findQueuedAttack(attacks, queuedAttack)?.line)).toStrictEqual([
      59, 56, 56, 66,
    ]);
  });

  test("fires an inline literal's attack from the call of the loop iteration it is in, its element that iteration's", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package varka",
          "",
          "var burstHitmark = []int{112, 131}",
          "",
          "func (c *char) burst() {",
          "\tele := []attributes.Element{attributes.Cryo, attributes.Anemo}",
          "\tfor i, hitmark := range burstHitmark {",
          "\t\tc.Core.QueueAttack(",
          "\t\t\tinfo.AttackInfo{AttackTag: attacks.AttackTagElementalBurst, Element: ele[i]},",
          "\t\t\tcombat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 6),",
          "\t\t\thitmark,",
          "\t\t\thitmark,",
          "\t\t)",
          "\t}",
          "}",
        ].join("\n"),
      },
    ];
    const constantMap = evaluateGoConstants(sources);
    const attacks = readGcsimAttacks(sources, constantMap, GCSIM_EMPTY_CONFIG);
    const queuedAttacks = readGcsimQueuedAttacks(sources, constantMap, GCSIM_EMPTY_CONFIG);

    expect(queuedAttacks.map((queuedAttack) => findQueuedAttack(attacks, queuedAttack)?.element)).toStrictEqual([
      "attributes.Cryo",
      "attributes.Anemo",
    ]);
  });

  test("fires no attack from a call of a block's variable bound to a method with no literal, and the outer attack after the block", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package xinyan",
          "",
          "func (c *char) burst() {",
          '\tai := info.AttackInfo{Abil: "Riff Revolution (DoT)", Mult: burstDot[c.TalentLvlBurst()]}',
          "\tc.Core.QueueAttack(ai, combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 3), 1, 57)",
          "\tif c.Base.Cons >= 2 {",
          "\t\tai := c.getShield()",
          "\t\tc.Core.QueueAttack(ai, combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 3), 1, 65)",
          "\t}",
          "\tc.Core.QueueAttack(ai, combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 3), 1, 74)",
          "}",
        ].join("\n"),
      },
    ];
    const constantMap = evaluateGoConstants(sources);
    const attacks = readGcsimAttacks(sources, constantMap, GCSIM_EMPTY_CONFIG);
    const queuedAttacks = readGcsimQueuedAttacks(sources, constantMap, GCSIM_EMPTY_CONFIG);

    expect(queuedAttacks.map((queuedAttack) => findQueuedAttack(attacks, queuedAttack)?.line)).toStrictEqual([
      4,
      undefined,
      4,
    ]);
  });

  test("fires the attack a method returns from a call bound to it, in whichever file the method is", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "burst.go",
        source: [
          "package xinyan",
          "",
          "func (c *char) burst() {",
          "\tai := c.getShield()",
          "\tc.Core.QueueAttack(ai, combat.NewCircleHitOnTarget(c.Core.Combat.Player(), nil, 3), 1, 65)",
          "}",
        ].join("\n"),
      },
      {
        path: "skill.go",
        source: [
          "package xinyan",
          "",
          "func (c *char) getShield() info.AttackInfo {",
          '\tai := info.AttackInfo{Abil: "Sweeping Fervor (DoT)", Mult: skillDot[c.TalentLvlSkill()]}',
          "\treturn ai",
          "}",
        ].join("\n"),
      },
    ];
    const constantMap = evaluateGoConstants(sources);
    const attacks = readGcsimAttacks(sources, constantMap, GCSIM_EMPTY_CONFIG);
    const queuedAttacks = readGcsimQueuedAttacks(sources, constantMap, GCSIM_EMPTY_CONFIG);

    expect(queuedAttacks.map((queuedAttack) => findQueuedAttack(attacks, queuedAttack)?.talentVariable)).toStrictEqual([
      "skillDot",
    ]);
  });
});

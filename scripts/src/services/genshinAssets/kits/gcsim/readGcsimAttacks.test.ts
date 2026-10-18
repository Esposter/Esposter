import {
  GCSIM_FIXTURE_DIRECTORY,
  GCSIM_ODETTE_FIXTURE_DIRECTORY,
  GCSIM_VARKA_FIXTURE_DIRECTORY,
} from "#src/services/genshinAssets/kits/gcsim/constants.test";
import { evaluateGoConstants } from "#src/services/genshinAssets/kits/gcsim/evaluateGoConstants";
import { readGcsimAttacks } from "#src/services/genshinAssets/kits/gcsim/readGcsimAttacks";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(readGcsimAttacks, () => {
  test("reads Xiangling's normal attack literal, its multiplier followed through the loop over `attack`", () => {
    expect.hasAssertions();

    const name = "attack.go";
    const sources = [{ path: name, source: readFileSync(join(GCSIM_FIXTURE_DIRECTORY, name), "utf8") }];

    expect(readGcsimAttacks(sources, evaluateGoConstants(sources))).toStrictEqual([
      {
        abil: undefined,
        attackTag: "attacks.AttackTagNormal",
        durability: 25,
        element: "attributes.Physical",
        fieldLineMap: {
          Abil: 57,
          ActorIndex: 56,
          AttackTag: 59,
          CanBeDefenseHalted: 67,
          Durability: 64,
          Element: 63,
          HitlagFactor: 65,
          HitlagHaltFrames: 66,
          ICDGroup: 61,
          ICDTag: 60,
          Mult: 58,
          StrikeType: 62,
        },
        file: name,
        internalCooldownTag: "attacks.ICDTagNormalAttack",
        line: 55,
        poiseDamage: undefined,
        poiseDamageVariable: undefined,
        siteLine: 55,
        talentVariable: "attack",
        variableName: "ai",
      },
    ]);
  });

  test("names a literal a helper returns by the helper and a literal assigned to a field by the field", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          "package dehya",
          "",
          "func (c *char) a1AttackInfo() info.AttackInfo {",
          "\treturn info.AttackInfo{AttackTag: attacks.AttackTagNormal}",
          "}",
          "",
          "func (c *char) skill() {",
          "\tc.skillAttackInfo = info.AttackInfo{AttackTag: attacks.AttackTagElementalArt}",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimAttacks(sources, evaluateGoConstants(sources)).map(({ variableName }) => variableName),
    ).toStrictEqual(["a1AttackInfo", "skillAttackInfo"]);
  });

  test("leaves a literal a closure returns unnamed, rather than naming it by the closure's result type", () => {
    expect.hasAssertions();

    const sources = [
      {
        path: "skill.go",
        source: [
          "package dehya",
          "",
          "func (c *char) skill() {",
          "\tc.Core.X(func() info.AttackInfo { return info.AttackInfo{AttackTag: attacks.AttackTagNormal} })",
          "}",
        ].join("\n"),
      },
    ];

    expect(
      readGcsimAttacks(sources, evaluateGoConstants(sources)).map(({ variableName }) => variableName),
    ).toStrictEqual([undefined]);
  });

  test("gives a Mult set after a literal its own attack under the variable it names, with the literal's element", () => {
    expect.hasAssertions();

    const source = [
      "func (c *char) burst() {",
      "\tai := info.AttackInfo{",
      "\t\tAttackTag: attacks.AttackTagDirectLunarCharged,",
      "\t\tElement:   attributes.Electro,",
      "\t\tMult:      burstMid[c.TalentLvlBurst()],",
      "\t}",
      "\tc.Core.QueueAttack(ai, ap, 0, 1)",
      "\tai.Mult = burstFinal[c.TalentLvlBurst()]",
      "\tc.Core.QueueAttack(ai, ap, 0, 2)",
      "}",
    ].join("\n");
    const sources = [{ path: "burst.go", source }];

    expect(
      readGcsimAttacks(sources, evaluateGoConstants(sources)).map(
        ({ element, line, talentVariable, variableName }) => ({ element, line, talentVariable, variableName }),
      ),
    ).toStrictEqual([
      { element: "attributes.Electro", line: 2, talentVariable: "burstMid", variableName: "ai" },
      { element: "attributes.Electro", line: 8, talentVariable: "burstFinal", variableName: "ai" },
    ]);
  });

  test("gives a Mult a loop sets after its literal one attack under the variable it names, its site the literal's line", () => {
    expect.hasAssertions();

    const source = `package navia

func (c *char) Skill() {
	ai := info.AttackInfo{
		Abil: "Rosula Shardshot",
	}
	for _, t := range targets {
		ai.Mult = skillshotgun[c.TalentLvlSkill()] * skillMultiplier[hits]
		c.Core.QueueAttackWithSnap(ai, snap, combat.NewSingleTargetHit(t.Key()), travelDelay)
	}
}
`;

    expect(
      readGcsimAttacks([{ path: "skill.go", source }], new Map()).map(
        ({ line, siteLine, talentVariable, variableName }) => ({ line, siteLine, talentVariable, variableName }),
      ),
    ).toStrictEqual([
      { line: 4, siteLine: 4, talentVariable: undefined, variableName: "ai" },
      { line: 8, siteLine: 4, talentVariable: "skillshotgun", variableName: "ai" },
    ]);
  });

  test("reads a struct copy as its source as of the copy, with the sets it gets after, its site the copy's own line", () => {
    expect.hasAssertions();

    const source = `package ayaka

func (c *char) Burst() {
	ai := info.AttackInfo{
		Abil: "Soumetsu",
	}
	ai.Mult = burstBloom[c.TalentLvlBurst()]
	var aiC2 info.AttackInfo
	aiC2 = ai
	aiC2.Mult = burstBloom[c.TalentLvlBurst()] * .2
	aiC2.Abil = "Mini-Frostflake"
}
`;

    expect(
      readGcsimAttacks([{ path: "burst.go", source }], new Map()).map(
        ({ line, siteLine, talentVariable, variableName }) => ({ line, siteLine, talentVariable, variableName }),
      ),
    ).toStrictEqual([
      { line: 4, siteLine: 4, talentVariable: undefined, variableName: "ai" },
      { line: 7, siteLine: 4, talentVariable: "burstBloom", variableName: "ai" },
      { line: 9, siteLine: 9, talentVariable: "burstBloom", variableName: "aiC2" },
      { line: 10, siteLine: 9, talentVariable: "burstBloom", variableName: "aiC2" },
    ]);
  });

  test("tags each Mult set in an if else's branches with its branch and the chain's last line, the literal and the call after untagged", () => {
    expect.hasAssertions();

    const name = "skill.go";
    const sources = [{ path: name, source: readFileSync(join(GCSIM_ODETTE_FIXTURE_DIRECTORY, name), "utf8") }];

    expect(
      readGcsimAttacks(sources, evaluateGoConstants(sources)).map(({ branch, line, talentVariable }) => ({
        branch,
        line,
        talentVariable,
      })),
    ).toStrictEqual([
      { branch: undefined, line: 12, talentVariable: undefined },
      { branch: { chain: 2, endLine: 30, index: 0 }, line: 25, talentVariable: "plume" },
      { branch: { chain: 2, endLine: 30, index: 1 }, line: 28, talentVariable: "wing" },
    ]);
  });

  test("reads a poise an if on a constant loop's variable sets on a copy as the copy's attack for that iteration only", () => {
    expect.hasAssertions();

    const name = "burst.go";
    const sources = [{ path: name, source: readFileSync(join(GCSIM_ODETTE_FIXTURE_DIRECTORY, name), "utf8") }];
    const fieldLineMap = {
      Abil: 48,
      ActorIndex: 47,
      AttackTag: 49,
      Durability: 54,
      Element: 53,
      ICDGroup: 51,
      ICDTag: 50,
      Mult: 55,
      StrikeType: 52,
    };
    const literal = {
      abil: "Presto: Bluebird Finale (Slash)",
      attackTag: "attacks.AttackTagElementalBurst",
      durability: 25,
      element: "attributes.Cryo",
      fieldLineMap,
      file: name,
      internalCooldownTag: "attacks.ICDTagElementalBurst",
      line: 46,
      poiseDamage: undefined,
      poiseDamageVariable: undefined,
      siteLine: 46,
      talentVariable: "burst",
      variableName: "ai",
    };

    expect(readGcsimAttacks(sources, evaluateGoConstants(sources))).toStrictEqual([
      literal,
      { ...literal, line: 66, siteLine: 66, variableName: "aiCopy" },
      {
        ...literal,
        branch: { chain: 0, endLine: 70, index: 0 },
        fieldLineMap: { ...fieldLineMap, PoiseDMG: 69 },
        iteration: { value: 0, variable: "i" },
        line: 69,
        poiseDamage: 30,
        siteLine: 66,
        variableName: "aiCopy",
      },
      {
        ...literal,
        abil: "Presto: Bluebird Finale (Final)",
        fieldLineMap: {
          Abil: 78,
          ActorIndex: 77,
          AttackTag: 79,
          Durability: 84,
          Element: 83,
          ICDGroup: 81,
          ICDTag: 80,
          Mult: 85,
          StrikeType: 82,
        },
        line: 76,
        siteLine: 76,
        talentVariable: "burstFinal",
        variableName: "aiFinal",
      },
    ]);
  });

  test("reads a constant loop's literal once per iteration, its element the local slice's entry the loop variable indexes", () => {
    expect.hasAssertions();

    const name = "burst.go";
    const sources = [{ path: name, source: readFileSync(join(GCSIM_VARKA_FIXTURE_DIRECTORY, name), "utf8") }];

    expect(
      readGcsimAttacks(sources, evaluateGoConstants(sources)).map(({ element, fieldLineMap, iteration, line }) => ({
        element,
        elementLine: fieldLineMap.Element,
        iteration,
        line,
      })),
    ).toStrictEqual([
      { element: undefined, elementLine: 30, iteration: { value: 0, variable: "i" }, line: 36 },
      { element: "attributes.Anemo", elementLine: 30, iteration: { value: 1, variable: "i" }, line: 36 },
    ]);
  });
});

import { GCSIM_FIXTURE_DIRECTORY } from "#src/services/genshinAssets/kits/gcsim/constants.test";
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
});

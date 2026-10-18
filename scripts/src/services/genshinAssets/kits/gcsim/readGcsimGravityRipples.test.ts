import type { GoSource } from "#src/models/genshinAssets/kits/gcsim/GoSource";

import { readGcsimGravityRipples } from "#src/services/genshinAssets/kits/gcsim/readGcsimGravityRipples";
import { describe, expect, test } from "vitest";

// Columbina's skill.go: the gravity tick's switch over the reaction that fires the ripple, each case setting its literal's
// Multiplier, element and label, and the bloom case its travel, with the init naming each reaction's hitmark constants
const skillSource = [
  "package columbina",
  "",
  "var (",
  "\tskillHitmarksLC  = 43",
  "\tskillHitmarksLB  = []int{51, 51 + 5}",
  "\tskillLBTravel    = 20",
  ")",
  "",
  "func init() {",
  "\tskillHitmarks[LunarCharge] = []int{skillHitmarksLC}",
  "\tskillHitmarks[LunarBloom] = skillHitmarksLB",
  "\tskillHitmarks[LunarCrystallize] = []int{skillHitmarksLCr}",
  "}",
  "",
  "func (c *char) gravityTick(clearGravity bool) {",
  "\tmaxReaction := LunarCharge",
  "\tradius := 6.0",
  "\ttravel := 0",
  "\tswitch maxReaction {",
  "\tcase LunarCharge:",
  "\t\tmult = skillLC[c.TalentLvlSkill()]",
  "\t\telem = attributes.Electro",
  '\t\tabil = "Gravity Interference (Lunar-Charged)"',
  "\tcase LunarBloom:",
  "\t\tmult = skillLB[c.TalentLvlSkill()]",
  "\t\telem = attributes.Dendro",
  '\t\tabil = "Gravity Interference (Lunar-Bloom)"',
  "\t\tradius = 0.5",
  "\t\ttravel = skillLBTravel",
  "\tcase LunarCrystallize:",
  "\t\tmult = skillLCr[c.TalentLvlSkill()]",
  "\t\telem = attributes.Geo",
  '\t\tabil = "Gravity Interference (Lunar-Crystallize)"',
  "\tdefault:",
  "\t\treturn",
  "\t}",
  "}",
];

describe(readGcsimGravityRipples, () => {
  test("reads each reaction's ripple from its switch case, with its hitmark constant and travel, and no travel where the case sets none", () => {
    expect.hasAssertions();

    const sources: GoSource[] = [{ path: "skill.go", source: skillSource.join("\n") }];

    expect(readGcsimGravityRipples(sources)).toStrictEqual([
      {
        abil: "Gravity Interference (Lunar-Charged)",
        element: "attributes.Electro",
        file: "skill.go",
        hitmarkName: "skillHitmarksLC",
        line: 20,
        reaction: "LunarCharge",
        talentVariable: "skillLC",
      },
      {
        abil: "Gravity Interference (Lunar-Bloom)",
        element: "attributes.Dendro",
        file: "skill.go",
        hitmarkName: "skillHitmarksLB",
        line: 24,
        reaction: "LunarBloom",
        talentVariable: "skillLB",
        travelName: "skillLBTravel",
      },
      {
        abil: "Gravity Interference (Lunar-Crystallize)",
        element: "attributes.Geo",
        file: "skill.go",
        hitmarkName: "skillHitmarksLCr",
        line: 30,
        reaction: "LunarCrystallize",
        talentVariable: "skillLCr",
      },
    ]);
  });
});

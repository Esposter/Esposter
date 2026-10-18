import { readGoBranchAt } from "#src/services/genshinAssets/kits/gcsim/readGoBranchAt";
import { tokenizeGo } from "#src/services/genshinAssets/kits/gcsim/tokenizeGo";
import { describe, expect, test } from "vitest";

// A switch like Columbina's gravity tick: each case sets the same local, and a nested if sits inside one case
const SWITCH_SOURCE = [
  "func (c *char) gravityTick(maxReaction info.ReactionType) {",
  "    var mult float64",
  "    switch maxReaction {",
  "    case LunarCharge:",
  "        mult = skillLC[c.TalentLvlSkill()]",
  "    case LunarBloom:",
  "        mult = skillLB[c.TalentLvlSkill()]",
  "        if c.Base.Cons >= 4 {",
  "            mult *= 2",
  "        }",
  "    default:",
  "        mult = skillLCr[c.TalentLvlSkill()]",
  "    }",
  "    ai := info.AttackInfo{Mult: mult}",
  "}",
].join("\n");

describe(readGoBranchAt, () => {
  test("reads each case clause of a switch as a branch numbered from zero in the order the clauses are written", () => {
    expect.hasAssertions();

    const tokens = tokenizeGo(SWITCH_SOURCE);
    const branchAt = readGoBranchAt(tokens);
    const branchOnLine = (line: number) =>
      branchAt(tokens.findIndex((token) => token.line === line && token.text === "mult"));

    expect([5, 7, 12].map((line) => branchOnLine(line))).toStrictEqual([
      { armCount: 3, chain: 0, endLine: 13, index: 0, isExhaustive: true },
      { armCount: 3, chain: 0, endLine: 13, index: 1, isExhaustive: true },
      { armCount: 3, chain: 0, endLine: 13, index: 2, isExhaustive: true },
    ]);
  });

  test("reads an if inside a case clause as the innermost branch, and a position after the switch as no branch", () => {
    expect.hasAssertions();

    const tokens = tokenizeGo(SWITCH_SOURCE);
    const branchAt = readGoBranchAt(tokens);
    const branchOnLine = (line: number) =>
      branchAt(tokens.findIndex((token) => token.line === line && token.text === "mult"));

    expect([2, 9, 14].map((line) => branchOnLine(line))).toStrictEqual([
      undefined,
      { armCount: 1, chain: 1, endLine: 10, index: 0, isExhaustive: false },
      undefined,
    ]);
  });
});

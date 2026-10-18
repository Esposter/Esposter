import { KitTargeting } from "genshin-world";
import { describe, expect, test } from "vitest";

import { getRuleKitCandidates } from "./getRuleKitCandidates";

const MULTIPLIER = { index: 5, proudSkillGroupId: 12_632 };

describe(getRuleKitCandidates, () => {
  test("targets a stance's strikes and charged attack as a strike, and its skill as a skill, as the kit's own actions are targeted", () => {
    expect.hasAssertions();

    const candidateMap = getRuleKitCandidates(
      new Map<string, unknown>([
        ["stances.lunarPhaseShift.normalAttacks.length", 1],
        ["stances.lunarPhaseShift.normalAttacks.0.hits.length", 1],
        ["stances.lunarPhaseShift.normalAttacks.0.hits.0.multiplier", MULTIPLIER],
        ["stances.lunarPhaseShift.chargedAttack.hits.length", 1],
        ["stances.lunarPhaseShift.chargedAttack.hits.0.multiplier", MULTIPLIER],
        ["stances.lunarPhaseShift.skill.hits.length", 1],
        ["stances.lunarPhaseShift.skill.hits.0.multiplier", MULTIPLIER],
      ]),
      undefined,
    );

    expect(
      candidateMap.get("stances.lunarPhaseShift.normalAttacks.0.targeting")?.map(({ value }) => value),
    ).toStrictEqual([KitTargeting.Strike]);
    expect(
      candidateMap.get("stances.lunarPhaseShift.chargedAttack.targeting")?.map(({ value }) => value),
    ).toStrictEqual([KitTargeting.Strike]);
    expect(candidateMap.get("stances.lunarPhaseShift.skill.targeting")?.map(({ value }) => value)).toStrictEqual([
      KitTargeting.Skill,
    ]);
  });
});

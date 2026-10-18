import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getRuleKitCandidates } from "#src/services/genshinAssets/kits/candidates/getRuleKitCandidates";
import { KitTargeting } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(getRuleKitCandidates, () => {
  test("gives a stance's normal attacks the strike targeting and no poise source, as a kit's own normal attacks take them", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([
      ["stances.chillingPenalty.normalAttacks.length", 1],
      ["stances.chillingPenalty.normalAttacks.0.hits.length", 2],
      ["stances.chillingPenalty.normalAttacks.0.hits.0.hitmarkFrames", 10],
      ["stances.chillingPenalty.normalAttacks.0.hits.1.hitmarkFrames", 12],
    ]);

    expect(getRuleKitCandidates(valueMap, undefined)).toStrictEqual(
      new Map([
        ["skillHolds.length", [{ provenance: { rule: KitRule.NoHold, source: KitSource.Rule }, value: 0 }]],
        [
          "plungeCollision.hitmarkFrames",
          [{ provenance: { rule: KitRule.CollisionHitmark, source: KitSource.Rule }, value: 0 }],
        ],
        [
          "plungeCollision.poiseDamage",
          [
            {
              provenance: {
                cause: KitProvisionalCause.NoPoiseSource,
                rule: KitRule.NoPoiseSource,
                source: KitSource.Rule,
              },
              value: 0,
            },
          ],
        ],
        [
          "stances.chillingPenalty.normalAttacks.0.targeting",
          [{ provenance: { rule: KitRule.Targeting, source: KitSource.Rule }, value: KitTargeting.Strike }],
        ],
        [
          "stances.chillingPenalty.normalAttacks.0.hits.0.poiseDamage",
          [
            {
              provenance: {
                cause: KitProvisionalCause.NoPoiseSource,
                rule: KitRule.NoPoiseSource,
                source: KitSource.Rule,
              },
              value: 0,
            },
          ],
        ],
        [
          "stances.chillingPenalty.normalAttacks.0.hits.1.poiseDamage",
          [
            {
              provenance: {
                cause: KitProvisionalCause.NoPoiseSource,
                rule: KitRule.NoPoiseSource,
                source: KitSource.Rule,
              },
              value: 0,
            },
          ],
        ],
      ]),
    );
  });

  test("gives a stance's skill the skill targeting a kit's own skill takes", () => {
    expect.hasAssertions();

    const candidateMap = getRuleKitCandidates(
      new Map<string, unknown>([
        ["stances.blessing.normalAttacks.length", 0],
        ["stances.blessing.skill.animationFrames", 52],
      ]),
      undefined,
    );

    expect(candidateMap.get("stances.blessing.skill.targeting")?.map(({ value }) => value)).toStrictEqual([
      KitTargeting.Skill,
    ]);
  });
});

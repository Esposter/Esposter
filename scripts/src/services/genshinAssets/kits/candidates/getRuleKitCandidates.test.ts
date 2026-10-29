import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { getRuleKitCandidates } from "#src/services/genshinAssets/kits/candidates/getRuleKitCandidates";
import { KitTargeting } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(getRuleKitCandidates, () => {
  test("gives a stance's normal attacks the strike targeting and no poise source, as a kit's own normal attacks take them", () => {
    expect.hasAssertions();

    const valueMap = new Map<string, unknown>([
      ["stances.chillingPenalty.normalAttacks.0.hits.0.hitmarkFrames", 10],
      ["stances.chillingPenalty.normalAttacks.0.hits.1.hitmarkFrames", 12],
      ["stances.chillingPenalty.normalAttacks.0.hits.length", 2],
      ["stances.chillingPenalty.normalAttacks.length", 1],
    ]);

    expect(getRuleKitCandidates(valueMap, undefined)).toStrictEqual(
      new Map([
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
        ["skillHolds.length", [{ provenance: { rule: KitRule.NoHold, source: KitSource.Rule }, value: 0 }]],
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
        [
          "stances.chillingPenalty.normalAttacks.0.targeting",
          [{ provenance: { rule: KitRule.Targeting, source: KitSource.Rule }, value: KitTargeting.Strike }],
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

  test("gives a kit's plunge variants the strike targeting a plunge takes, one per variant", () => {
    expect.hasAssertions();

    const candidateMap = getRuleKitCandidates(
      new Map<string, unknown>([
        ["plungeVariants.0.hits.0.hitmarkFrames", 35],
        ["plungeVariants.0.hits.length", 1],
        ["plungeVariants.1.hits.0.hitmarkFrames", 40],
        ["plungeVariants.1.hits.length", 1],
        ["plungeVariants.length", 2],
      ]),
      undefined,
    );

    expect(
      ["plungeVariants.0.targeting", "plungeVariants.1.targeting"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([[KitTargeting.Strike], [KitTargeting.Strike]]);
  });

  test("gives a stance's charged attack the strike targeting a kit's own charged attack takes", () => {
    expect.hasAssertions();

    const candidateMap = getRuleKitCandidates(
      new Map<string, unknown>([["stances.blessing.chargedAttack.hits.length", 1]]),
      undefined,
    );

    expect(candidateMap.get("stances.blessing.chargedAttack.targeting")?.map(({ value }) => value)).toStrictEqual([
      KitTargeting.Strike,
    ]);
  });
});

import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitActionRecord } from "#src/models/kit/record/KitActionRecord";
import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";
import type { KitRecord } from "#src/models/kit/record/KitRecord";
import type { RequiredKeysOf } from "type-fest";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitPlunge } from "#src/models/kit/record/KitPlunge";
import { KitTargeting } from "#src/models/kit/record/KitTargeting";
import { buildKit } from "#src/services/kit/buildKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(buildKit, () => {
  const PROUD_SKILL_GROUP_ID = 1;
  const TALENT_MULTIPLIER_MAP: TalentMultiplierMap = {
    [PROUD_SKILL_GROUP_ID]: [
      { level: 1, paramList: [0.5, 15] },
      { level: 13, paramList: [0.75, 20] },
    ],
  };
  const TALENT_LEVEL_MAP = { [PROUD_SKILL_GROUP_ID]: 1 };
  const HIT_RECORD: KitHitRecord = {
    area: { angle: 2 * Math.PI, height: 2, radius: 1 },
    hitmarkFrames: 12,
    multiplier: { index: 0, proudSkillGroupId: PROUD_SKILL_GROUP_ID },
    poiseDamage: 0,
  };
  const createActionRecord = (hits: KitHitRecord[] = [HIT_RECORD]): KitActionRecord => ({
    animationFrames: 30,
    hits,
    targeting: KitTargeting.Strike,
  });
  const RECORD: KitRecord = {
    burst: createActionRecord(),
    burstCooldownSeconds: { index: 1, proudSkillGroupId: PROUD_SKILL_GROUP_ID },
    chargedAttack: createActionRecord(),
    chargedAttackStamina: 20,
    frames: { cast: 90 },
    hits: { explosion: HIT_RECORD },
    normalAttacks: [createActionRecord()],
    plungeCollision: HIT_RECORD,
    plunges: { [KitPlunge.High]: createActionRecord(), [KitPlunge.Low]: createActionRecord() },
    skill: createActionRecord(),
    skillCooldownSeconds: 6,
    skillHolds: [],
    stances: { dance: { normalAttacks: [createActionRecord([])] } },
  };

  test("resolves each frame count into seconds and each parameter off its talent's table, and tags each hit", () => {
    expect.hasAssertions();

    const kit = buildKit(RECORD, TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP, () => ({}));
    const { actionAttackTag, hitmarkSeconds, talentMultiplier } = takeOne(takeOne(kit.normalAttacks).hits);

    expect({
      actionAttackTag,
      burstCooldownSeconds: kit.burstCooldownSeconds,
      burstEnergyCost: kit.burstEnergyCost,
      hitmarkSeconds,
      seconds: takeOne(kit.normalAttacks).seconds,
      talentMultiplier,
    }).toStrictEqual({
      actionAttackTag: AttackTag.NormalAttack,
      burstCooldownSeconds: 15,
      burstEnergyCost: Number.POSITIVE_INFINITY,
      hitmarkSeconds: 0.2,
      seconds: 0.5,
      talentMultiplier: 0.5,
    });
  });

  test("reads each parameter at the level its talent plays at", () => {
    expect.hasAssertions();
    const kit = buildKit(RECORD, TALENT_MULTIPLIER_MAP, { [PROUD_SKILL_GROUP_ID]: 13 }, () => ({}));
    const { talentMultiplier } = takeOne(takeOne(kit.normalAttacks).hits);

    expect({ burstCooldownSeconds: kit.burstCooldownSeconds, talentMultiplier }).toStrictEqual({
      burstCooldownSeconds: 20,
      talentMultiplier: 0.75,
    });
  });

  test("hands its behaviour a reader of the record's named values over the very kit it builds", () => {
    expect.hasAssertions();
    let castSeconds = 0;
    let stanceSkill: unknown;

    const kit = buildKit(RECORD, TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP, ({ readSeconds, readStance }) => {
      castSeconds = readSeconds("cast");
      ({ elementalSkill: stanceSkill } = readStance("dance"));
      return {};
    });

    expect(castSeconds).toBe(1.5);
    expect(stanceSkill).toBe(kit.elementalSkill);
  });

  test("fails on a name its record's bag does not hold, or holds in the other shape", () => {
    expect.hasAssertions();

    expect(() =>
      buildKit(RECORD, TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP, ({ readHit }) => {
        readHit("missing");
        return {};
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: hits.missing, is not in its kit's record]`,
    );
    expect(() =>
      buildKit(RECORD, TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP, ({ readHits }) => {
        readHits("explosion");
        return {};
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: hits.explosion, is not a list]`,
    );
  });

  test("fails where its behaviour names more hits than its action holds", () => {
    expect.hasAssertions();

    expect(() =>
      buildKit(RECORD, TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP, () => ({ burst: { hits: [{}, {}] } })),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: burst, its record holds 1 hits]`,
    );
  });

  test("fails where a record's party heal is left without the chance its behaviour gives", () => {
    expect.hasAssertions();
    const record: KitRecord = {
      ...RECORD,
      skill: createActionRecord([{ ...HIT_RECORD, healParty: { defenseShare: 0, flatHealth: 100 } }]),
    };

    expect(() =>
      buildKit(record, TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP, () => ({})),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: skill.hits.0, its behaviour leaves its bubble's omen, its party heal's chance or its stacked hit's status missing]`,
    );
    expect(
      takeOne(
        buildKit(record, TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP, () => ({
          skill: { hits: [{ healPartyChance: () => 1 }] },
        })).elementalSkill.hits,
      ).healParty?.flatHealth,
    ).toBe(100);
  });

  test("fails where a behaviour reads a hit's fields holding a party heal no behaviour completes", () => {
    expect.hasAssertions();
    const record: KitRecord = { ...RECORD, hitFields: { heal: { healParty: { defenseShare: 0, flatHealth: 100 } } } };

    expect(() =>
      buildKit(record, TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP, ({ readHitFields }) => {
        readHitFields("heal", ["hitArea", "hitmarkSeconds", "poiseDamage", "talentMultiplier"]);
        return {};
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: hitFields.heal, holds what only a behaviour completes]`,
    );
  });

  test.each<[string, RequiredKeysOf<KitHit>[]]>([
    ["lacking a field it names none to give", []],
    ["holding a field it names to give", ["hitmarkSeconds", "talentMultiplier"]],
  ])("fails where a behaviour reads a hit's fields %s", (_name, shortFields) => {
    expect.hasAssertions();
    const { area, hitmarkFrames, poiseDamage } = HIT_RECORD;
    const record: KitRecord = { ...RECORD, hitFields: { explosion: { area, hitmarkFrames, poiseDamage } } };

    expect(() =>
      buildKit(record, TALENT_MULTIPLIER_MAP, TALENT_LEVEL_MAP, ({ readHitFields }) => {
        readHitFields("explosion", shortFields);
        return {};
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: hitFields.explosion, is not a hit short of exactly what its behaviour gives]`,
    );
  });
});

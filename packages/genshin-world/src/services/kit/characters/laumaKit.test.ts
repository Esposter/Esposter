import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createLaumaKitBehaviour, LAUMA_CHARACTER_ID } from "#src/services/kit/characters/laumaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const LAUMA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, LAUMA_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createCombatant = (elementalMastery: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: elementalMastery }]),
  characterId: LAUMA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: LAUMA_KIT,
  level: 90,
});

describe(createLaumaKitBehaviour, () => {
  // Hymn of Eternal Rest's Lunar-Bloom multiplier of her Elemental Mastery for each Dew, at talent level 1
  const LUNAR_BLOOM_MULTIPLIER = 1.52;

  test("reads the strikes', charged attack's, plunges' and press's multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...LAUMA_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      LAUMA_KIT.chargedAttack.hits[0]?.talentMultiplier,
      LAUMA_KIT.plungeCollision.talentMultiplier,
      LAUMA_KIT.lowPlunge.hits[0]?.talentMultiplier,
      LAUMA_KIT.highPlunge.hits[0]?.talentMultiplier,
      LAUMA_KIT.elementalSkill.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.337024, 0.318048, 0.444968, 1.2904, 0.568288, 1.136335, 1.419344, 1.216]);
  });

  test("her burst costs 60 energy and cools for 15 seconds, her skill cools for 12 seconds, and her charged attack costs no stamina", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: LAUMA_KIT.burstCooldownSeconds,
      burstEnergyCost: LAUMA_KIT.burstEnergyCost,
      chargedAttackStamina: LAUMA_KIT.chargedAttackStamina,
      skillCooldownSeconds: LAUMA_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 0,
      skillCooldownSeconds: 12,
    });
  });

  test("her three strikes hit at their hitmarks and cancel at their default frames", () => {
    expect.hasAssertions();
    expect(
      LAUMA_KIT.normalAttacks.map(({ hits, seconds }) => ({
        hitmarkFrames: Math.round((hits[0]?.hitmarkSeconds ?? 0) * 60),
        seconds: Math.round(seconds * 60),
      })),
    ).toStrictEqual([
      { hitmarkFrames: 14, seconds: 29 },
      { hitmarkFrames: 11, seconds: 33 },
      { hitmarkFrames: 16, seconds: 38 },
    ]);
  });

  test("the charged attack, Spiritcall Prayer, hits at 73 frames, after its 68-frame animation", () => {
    expect.hasAssertions();
    expect({
      hitmarkFrames: Math.round((LAUMA_KIT.chargedAttack.hits[0]?.hitmarkSeconds ?? 0) * 60),
      seconds: Math.round(LAUMA_KIT.chargedAttack.seconds * 60),
    }).toStrictEqual({ hitmarkFrames: 73, seconds: 68 });
  });

  test("the press of Hymn of Hunting hits at 16 frames, and its hold plays Hymn of Eternal Rest only while the party holds Verdant Dew", () => {
    expect.hasAssertions();

    const hold = takeOne(LAUMA_KIT.elementalSkillHolds ?? [], 0);
    const context = createKitTestContext(createCombatant(0));
    const isActiveWithoutDew = hold.variant?.checkIsActive(context);
    context.party.verdantDew.count = 1;

    expect({
      holdHitmarkFrames: Math.round((hold.variant?.action.hits[0]?.hitmarkSeconds ?? 0) * 60),
      holdSeconds: Math.round((hold.variant?.action.seconds ?? 0) * 60),
      isActiveWithDew: hold.variant?.checkIsActive(context),
      isActiveWithoutDew,
      pressHitmarkFrames: Math.round((LAUMA_KIT.elementalSkill.hits[0]?.hitmarkSeconds ?? 0) * 60),
    }).toStrictEqual({
      holdHitmarkFrames: 45,
      holdSeconds: 64,
      isActiveWithDew: true,
      isActiveWithoutDew: false,
      pressHitmarkFrames: 16,
    });
  });

  test("spends up to three Dew with Hymn of Eternal Rest on a Lunar-Bloom hit of its multiplier for each, beside the sanctuary", () => {
    expect.hasAssertions();

    const holdAction = takeOne(LAUMA_KIT.elementalSkillHolds ?? [], 0).variant?.action;
    const context = createKitTestContext(createCombatant(0));
    context.party.verdantDew.count = 2;
    holdAction?.onStart?.(context);
    const lunarHits = context.kitEffectState.effects.flatMap((effect) =>
      effect.kind === "summon" ? effect.hits.filter(({ lunarHit }) => lunarHit) : [],
    );

    expect({
      dewCount: context.party.verdantDew.count,
      lunarHitMultipliers: lunarHits.map(({ talentMultiplier }) => talentMultiplier),
      summonCount: context.kitEffectState.effects.filter(({ kind }) => kind === "summon").length,
    }).toStrictEqual({
      dewCount: 0,
      lunarHitMultipliers: [expect.closeTo(2 * LUNAR_BLOOM_MULTIPLIER)],
      summonCount: 2,
    });
  });

  test("her Moonsign Benediction turns Bloom Lunar, with 0.0175% Base DMG Bonus a point of Elemental Mastery, at most 14%", () => {
    expect.hasAssertions();

    const benediction = LAUMA_KIT.moonsignBenediction;

    expect({
      baseDamageBonuses: [400, 1000].map((elementalMastery) =>
        benediction?.getBaseDamageBonus?.(createCombatant(elementalMastery)),
      ),
      lunarReactionTypes: benediction?.lunarReactionTypes,
    }).toStrictEqual({
      baseDamageBonuses: [expect.closeTo(0.07), 0.14],
      lunarReactionTypes: [LunarReactionType.LunarBloom],
    });
  });
});

// The Elemental Skill DMG Bonus Cleansing for the Spring gives a hit of hers, with her at the given ascension and Elemental
// Mastery
const readSkillDamageBonus = (ascension: number, elementalMastery: number): number => {
  const combatant = { ...createCombatant(elementalMastery), ascension };
  return (
    LAUMA_KIT.getStrikeDamageBonus?.(
      {
        attackTag: AttackTag.ElementalSkill,
        body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
        combatant,
        hit: takeOne(LAUMA_KIT.elementalSkill.hits),
      },
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      createParty([LAUMA_CHARACTER_ID]),
    ) ?? 0
  );
};

describe("cleansing for the Spring", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect([readSkillDamageBonus(4, 500), readSkillDamageBonus(4, 1000)]).toStrictEqual([0.0004 * 500, 0.32]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readSkillDamageBonus(3, 1000)).toBe(0);
  });
});

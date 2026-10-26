import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createFlinsKitBehaviour, FLINS_CHARACTER_ID } from "#src/services/kit/characters/flinsKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { landKitHits } from "#src/services/kit/landKitHits";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const FLINS_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, FLINS_CHARACTER_ID);
const createFlinsCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: FLINS_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: FLINS_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

// The landed hits of the burst at the context, every hit's hitmark having fallen
const countBurstLandedHits = (context: KitContext): number => {
  const landedHits: KitHit[] = [];
  landKitHits(FLINS_KIT.elementalBurst.hits, 0, Number.POSITIVE_INFINITY, landedHits, context);
  return landedHits.length;
};

// A combatant whose kit is a Moonsign benediction, the member a team's Ascendant Gleam counts
const withBenediction = (combatant: Combatant): Combatant => ({
  ...combatant,
  kit: { ...combatant.kit, moonsignBenediction: { getBaseDamageBonus: () => 0, lunarReactionTypes: [] } },
});

// Flins with his ATK at 1000, at the ascension, as the passive bonus reads him
const getPassiveBonuses = (ascension: number) =>
  FLINS_KIT.getPassiveBonuses?.(
    {
      ascension,
      attributes: computeCharacterAttributes([{ attribute: Attribute.Attack, value: 1000 }]),
      characterId: FLINS_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: FLINS_KIT,
      level: 90,
    },
    1,
    [],
    [],
  );

describe(createFlinsKitBehaviour, () => {
  test("reads the strikes', charged attack's, plunges' and burst's initial, middle and final multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...FLINS_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      FLINS_KIT.chargedAttack.hits[0]?.talentMultiplier,
      FLINS_KIT.plungeCollision.talentMultiplier,
      FLINS_KIT.lowPlunge.hits[0]?.talentMultiplier,
      FLINS_KIT.highPlunge.hits[0]?.talentMultiplier,
      FLINS_KIT.elementalBurst.hits[0]?.talentMultiplier,
      FLINS_KIT.elementalBurst.hits[1]?.talentMultiplier,
      FLINS_KIT.elementalBurst.hits[5]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.44726, 0.451483, 0.559198, 0.320389, 0.320389, 0.767946, 1.03028, 0.639324, 1.278377, 1.596762, 2.5984, 0.1624,
      1.16928,
    ]);
  });

  test("his burst costs 80 energy and cools for 20 seconds, his skill cools for 16 seconds, and his charged attack costs 25 stamina", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: FLINS_KIT.burstCooldownSeconds,
      burstEnergyCost: FLINS_KIT.burstEnergyCost,
      chargedAttackStamina: FLINS_KIT.chargedAttackStamina,
      skillCooldownSeconds: FLINS_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 20,
      burstEnergyCost: 80,
      chargedAttackStamina: 25,
      skillCooldownSeconds: 16,
    });
  });

  test("his five strikes hit at their hitmarks and cancel at their default frames", () => {
    expect.hasAssertions();
    expect(
      FLINS_KIT.normalAttacks.map(({ hits, seconds }) => ({
        hitmarkFrames: hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)),
        seconds: Math.round(seconds * 60),
      })),
    ).toStrictEqual([
      { hitmarkFrames: [11], seconds: 31 },
      { hitmarkFrames: [11], seconds: 31 },
      { hitmarkFrames: [16], seconds: 45 },
      { hitmarkFrames: [20, 29], seconds: 67 },
      { hitmarkFrames: [29], seconds: 68 },
    ]);
  });

  test("the burst's initial hit lands at 93 frames, its middle hits at 110, 119, 128 and 137, and its final at 164", () => {
    expect.hasAssertions();
    expect(FLINS_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      93, 110, 119, 128, 137, 164,
    ]);
  });

  test("the burst's third and fourth middle hits land only at Ascendant Gleam", () => {
    expect.hasAssertions();
    const flins = createFlinsCombatant(0);

    // Flins alone is no Moonsign, so his burst lands its initial, first two middle and final hits
    expect(countBurstLandedHits(createKitTestContext(flins))).toBe(4);

    // Two Moonsign benedictions deployed make Ascendant Gleam, which lands the two further middle hits too
    const gleamFlins = withBenediction(flins);
    const gleamContext = createKitTestContext(gleamFlins, {
      characterIdCombatantMap: new Map([
        [10_000_002, withBenediction({ ...flins, characterId: 10_000_002 })],
        [FLINS_CHARACTER_ID, gleamFlins],
      ]),
      party: createParty([FLINS_CHARACTER_ID, 10_000_002]),
    });
    expect(countBurstLandedHits(gleamContext)).toBe(6);
  });

  test("the press of Manifest Flame plays no hit of its own, and Northland Spearstorm is not built", () => {
    expect.hasAssertions();
    expect({ pressHits: FLINS_KIT.elementalSkill.hits, skillHolds: FLINS_KIT.elementalSkillHolds }).toStrictEqual({
      pressHits: [],
      skillHolds: undefined,
    });
  });

  test("the Ascension 4 passive, Whispering Flame, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(getPassiveBonuses(4)).toStrictEqual([{ amount: 80, attribute: Attribute.ElementalMastery }]);
  });

  test("the Ascension 4 passive, Whispering Flame, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(getPassiveBonuses(3)).toStrictEqual([]);
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();

    expect(FLINS_KIT.getPassiveBonuses?.(createFlinsCombatant(4), 1, [], [])).toStrictEqual([
      { amount: 0.2, attribute: Attribute.AttackPercent },
    ]);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();

    expect(FLINS_KIT.getPassiveBonuses?.(createFlinsCombatant(3), 1, [], [])).toStrictEqual([]);
  });
});

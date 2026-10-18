import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createGamingKitBehaviour, GAMING_CHARACTER_ID } from "#src/services/kit/characters/gamingKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const GAMING_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, GAMING_CHARACTER_ID);

// The passive bonuses a combatant of the ascension and the HP share reads from Gaming's kit
const getPassiveBonuses = (ascension: number, healthShare: number) =>
  GAMING_KIT.getPassiveBonuses?.(
    {
      ascension,
      attributes: computeCharacterAttributes([]),
      characterId: GAMING_CHARACTER_ID,
      constellationCount: 0,
      elementalResonances: [],
      kit: GAMING_KIT,
      level: 90,
    },
    healthShare,
  );

describe(createGamingKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...GAMING_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(GAMING_KIT.chargedAttack.hits).talentMultiplier,
      GAMING_KIT.plungeCollision.talentMultiplier,
      takeOne(GAMING_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(GAMING_KIT.highPlunge.hits).talentMultiplier,
      takeOne(GAMING_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.8386, 0.7904, 1.0665, 1.2795, 1.1309, 0.6415, 1.2826, 1.6021, 3.704];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("reads the skill's cooldown, the burst's cooldown and energy cost, and the charged attack's stamina from their groups", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: GAMING_KIT.burstCooldownSeconds,
      burstEnergyCost: GAMING_KIT.burstEnergyCost,
      chargedAttackStamina: GAMING_KIT.chargedAttackStamina,
      skillCooldownSeconds: GAMING_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 40,
      skillCooldownSeconds: 6,
    });
  });

  test("strikes its four normal attacks at their hitmarks, and its burst's one hit lands at a second", () => {
    expect.hasAssertions();
    expect(GAMING_KIT.normalAttacks.map((action) => takeOne(action.hits).hitmarkSeconds)).toStrictEqual([
      25 / 60,
      18 / 60,
      34 / 60,
      48 / 60,
    ]);
    expect(GAMING_KIT.elementalBurst.hits.map((hit) => hit.hitmarkSeconds)).toStrictEqual([1]);
  });

  test("lands the collision six frames before the low plunge's hitmark, with the plunges' poise", () => {
    expect.hasAssertions();
    expect({
      collision: GAMING_KIT.plungeCollision.hitmarkSeconds,
      high: {
        hitmarkSeconds: takeOne(GAMING_KIT.highPlunge.hits).hitmarkSeconds,
        poiseDamage: takeOne(GAMING_KIT.highPlunge.hits).poiseDamage,
      },
      low: {
        hitmarkSeconds: takeOne(GAMING_KIT.lowPlunge.hits).hitmarkSeconds,
        poiseDamage: takeOne(GAMING_KIT.lowPlunge.hits).poiseDamage,
      },
    }).toStrictEqual({
      collision: 37 / 60,
      high: { hitmarkSeconds: 46 / 60, poiseDamage: 200 },
      low: { hitmarkSeconds: 43 / 60, poiseDamage: 150 },
    });
  });

  test("the Ascension 4 passive, Air of Prosperity, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(getPassiveBonuses(4, 0.4)).toStrictEqual([{ amount: 0.2, attribute: Attribute.IncomingHealingBonus }]);
  });

  test("the Ascension 4 passive, Air of Prosperity, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(getPassiveBonuses(3, 0.4)).toStrictEqual([]);
  });
});

import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createFlinsKitBehaviour, FLINS_CHARACTER_ID } from "#src/services/kit/characters/flinsKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
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

describe(createFlinsKitBehaviour, () => {
  test("reads the strikes', charged attack's, plunges' and burst's multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...FLINS_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      FLINS_KIT.chargedAttack.hits[0]?.talentMultiplier,
      FLINS_KIT.plungeCollision.talentMultiplier,
      FLINS_KIT.lowPlunge.hits[0]?.talentMultiplier,
      FLINS_KIT.highPlunge.hits[0]?.talentMultiplier,
      FLINS_KIT.elementalBurst.hits[0]?.talentMultiplier,
      FLINS_KIT.elementalBurst.hits[1]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.44726, 0.451483, 0.559198, 0.320389, 0.320389, 0.767946, 1.03028, 0.639324, 1.278377, 1.596762, 2.5984, 1.16928,
    ]);
  });

  test("his burst costs 80 energy and cools for 15 seconds, his skill cools for 16 seconds, and his charged attack costs 25 stamina", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: FLINS_KIT.burstCooldownSeconds,
      burstEnergyCost: FLINS_KIT.burstEnergyCost,
      chargedAttackStamina: FLINS_KIT.chargedAttackStamina,
      skillCooldownSeconds: FLINS_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
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

  test("the burst's initial hit lands at 93 frames and its final at 164, with its middle hits not built", () => {
    expect.hasAssertions();
    expect(FLINS_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      93, 164,
    ]);
  });

  test("the press of Manifest Flame plays no hit of its own, and Northland Spearstorm is not built", () => {
    expect.hasAssertions();
    expect({ pressHits: FLINS_KIT.elementalSkill.hits, skillHolds: FLINS_KIT.elementalSkillHolds }).toStrictEqual({
      pressHits: [],
      skillHolds: undefined,
    });
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();

    expect(FLINS_KIT.getPassiveBonuses?.(createFlinsCombatant(4), 1)).toStrictEqual([
      { amount: 0.2, attribute: Attribute.AttackPercent },
    ]);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();

    expect(FLINS_KIT.getPassiveBonuses?.(createFlinsCombatant(3), 1)).toStrictEqual([]);
  });
});

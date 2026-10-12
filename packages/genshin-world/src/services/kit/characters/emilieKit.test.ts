import type { Combatant } from "#src/models/kit/Combatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createEmilieKitBehaviour, EMILIE_CHARACTER_ID } from "#src/services/kit/characters/emilieKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const EMILIE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, EMILIE_CHARACTER_ID);
const createEmilieCombatant = (ascension: number, constellationCount: number): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: EMILIE_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: EMILIE_KIT,
  level: 90,
});

describe(createEmilieKitBehaviour, () => {
  test("reads each talent multiplier, cooldown and cost from her proud skill groups, to four decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...EMILIE_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier),
      EMILIE_KIT.chargedAttack.hits[0]?.talentMultiplier,
      EMILIE_KIT.plungeCollision.talentMultiplier,
      EMILIE_KIT.lowPlunge.hits[0]?.talentMultiplier,
      EMILIE_KIT.highPlunge.hits[0]?.talentMultiplier,
      EMILIE_KIT.elementalSkill.hits[0]?.talentMultiplier,
      EMILIE_KIT.elementalSkill.hits[1]?.talentMultiplier,
    ].map((multiplier) => Number(multiplier?.toFixed(4)));

    expect(multipliers).toStrictEqual([0.4856, 0.449, 0.593, 0.751, 0.9133, 0.6393, 1.2784, 1.5968, 0.4708, 0.3852]);
    expect([
      EMILIE_KIT.chargedAttackStamina,
      EMILIE_KIT.skillCooldownSeconds,
      EMILIE_KIT.burstCooldownSeconds,
      EMILIE_KIT.burstEnergyCost,
    ]).toStrictEqual([25, 14, 13.5, 50]);
  });

  test.each([
    [1, undefined],
    [
      2,
      {
        damageTakenBonus: 0,
        id: "emilie-constellation-2",
        resistanceReduction: { [Element.Dendro]: 0.3 },
        secondsRemaining: 10,
      },
    ],
  ])(
    "at %i constellations, a skill hit cuts an enemy's Dendro RES as Constellation 2 does: %j",
    (constellationCount, enemyStatus) => {
      expect.hasAssertions();
      const combatant = createEmilieCombatant(0, constellationCount);

      expect(EMILIE_KIT.elementalSkill.hits.map((hit) => hit.enemyStatus?.(combatant))).toStrictEqual([
        enemyStatus,
        enemyStatus,
      ]);
    },
  );
});

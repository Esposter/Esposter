import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createNeuvilletteKitBehaviour, NEUVILLETTE_CHARACTER_ID } from "#src/services/kit/characters/neuvilletteKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const NEUVILLETTE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, NEUVILLETTE_CHARACTER_ID);

// The passive bonuses a combatant gets at an ascension phase and HP share, each as its attribute and amount to a thousandth
const getPassiveBonusPairs = (ascension: number, healthShare: number): [Attribute, number][] =>
  (
    createNeuvilletteKitBehaviour().getPassiveBonuses?.(
      {
        ascension,
        attributes: computeCharacterAttributes([]),
        characterId: NEUVILLETTE_CHARACTER_ID,
        constellationCount: 0,
        elementalResonances: [],
        kit: NEUVILLETTE_KIT,
        level: 90,
      },
      healthShare,
      [],
    ) ?? []
  ).map(({ amount, attribute }) => [attribute, Math.round(amount * 1000) / 1000]);

describe(createNeuvilletteKitBehaviour, () => {
  test("reads the strikes', charged attack's, plunges' and Spiritbreath Thorn's multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...NEUVILLETTE_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      NEUVILLETTE_KIT.chargedAttack.hits[0]?.talentMultiplier,
      NEUVILLETTE_KIT.plungeCollision.talentMultiplier,
      NEUVILLETTE_KIT.lowPlunge.hits[0]?.talentMultiplier,
      NEUVILLETTE_KIT.highPlunge.hits[0]?.talentMultiplier,
      NEUVILLETTE_KIT.elementalSkill.hits[1]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.545768, 0.462456, 0.723376, 1.368, 0.568288, 1.136335, 1.419344, 0.208]);
  });

  test("the charged attack costs 50 stamina, his burst costs 70 energy and cools for 18 seconds, and his skill cools for 12 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: NEUVILLETTE_KIT.burstCooldownSeconds,
      burstEnergyCost: NEUVILLETTE_KIT.burstEnergyCost,
      chargedAttackStamina: NEUVILLETTE_KIT.chargedAttackStamina,
      skillCooldownSeconds: NEUVILLETTE_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 18,
      burstEnergyCost: 70,
      chargedAttackStamina: 50,
      skillCooldownSeconds: 12,
    });
  });

  test("his strikes deal hydro, and his skill's and burst's hits land at their hitmarks, past their animations too", () => {
    expect.hasAssertions();
    expect({
      burstHitmarkFrames: NEUVILLETTE_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      normalAttackElements: NEUVILLETTE_KIT.normalAttacks.map(({ hits }) => hits[0]?.element),
      skillHitmarkFrames: NEUVILLETTE_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
    }).toStrictEqual({
      burstHitmarkFrames: [95, 135, 154],
      normalAttackElements: [Element.Hydro, Element.Hydro, Element.Hydro],
      skillHitmarkFrames: [23, 60],
    });
  });

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    expect(getPassiveBonusPairs(4, 0.5)).toStrictEqual([[Attribute.HydroDamageBonus, 0.12]]);
    expect(getPassiveBonusPairs(4, 1)).toStrictEqual([[Attribute.HydroDamageBonus, 0.3]]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    expect(getPassiveBonusPairs(3, 0.5)).toStrictEqual([]);
  });
});

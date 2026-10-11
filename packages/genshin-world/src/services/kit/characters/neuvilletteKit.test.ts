import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { createNeuvilletteKit, NEUVILLETTE_CHARACTER_ID } from "#src/services/kit/characters/neuvilletteKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { describe, expect, test } from "vitest";

const NEUVILLETTE_KIT = createNeuvilletteKit(
  await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [NEUVILLETTE_CHARACTER_ID]),
);

describe(createNeuvilletteKit, () => {
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
      normalAttackElements: NEUVILLETTE_KIT.normalAttacks.map(({ hits }) => hits[0]?.element),
      skillHitmarkFrames: NEUVILLETTE_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
      burstHitmarkFrames: NEUVILLETTE_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) =>
        Math.round(hitmarkSeconds * 60),
      ),
    }).toStrictEqual({
      burstHitmarkFrames: [95, 135, 154],
      normalAttackElements: [Element.Hydro, Element.Hydro, Element.Hydro],
      skillHitmarkFrames: [23, 60],
    });
  });
});

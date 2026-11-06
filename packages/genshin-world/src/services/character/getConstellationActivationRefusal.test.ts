import type { Character } from "#src/models/character/Character";
import type { Constellation } from "#src/models/character/Constellation";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { ConstellationActivationRefusal } from "#src/models/character/ConstellationActivationRefusal";
import { getConstellationActivationRefusal } from "#src/services/character/getConstellationActivationRefusal";
import { describe, expect, test } from "vitest";

describe(getConstellationActivationRefusal, () => {
  const CHARACTER: Character = {
    artifacts: [],
    ascension: 0,
    constellationCount: 2,
    friendshipExp: 0,
    id: 1,
    level: 1,
    stellaFortunaCount: 1,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };
  const CONSTELLATIONS: Constellation[] = [
    { descriptionTextId: "1", nameTextId: "1", paramList: [] },
    { descriptionTextId: "2", nameTextId: "2", paramList: [] },
    { descriptionTextId: "3", nameTextId: "3", paramList: [] },
  ];

  test("activate is disabled with no Stella Fortuna held", () => {
    expect.hasAssertions();

    expect(getConstellationActivationRefusal({ ...CHARACTER, stellaFortunaCount: 0 }, CONSTELLATIONS)).toBe(
      ConstellationActivationRefusal.NoStellaFortuna,
    );
  });

  test("activate is disabled when all six constellations are active", () => {
    expect.hasAssertions();

    expect(getConstellationActivationRefusal({ ...CHARACTER, constellationCount: 3 }, CONSTELLATIONS)).toBe(
      ConstellationActivationRefusal.AllActive,
    );
  });

  test("activate is not refused while a constellation is inactive and a Stella Fortuna is held", () => {
    expect.hasAssertions();

    expect(getConstellationActivationRefusal(CHARACTER, CONSTELLATIONS)).toBeUndefined();
  });
});

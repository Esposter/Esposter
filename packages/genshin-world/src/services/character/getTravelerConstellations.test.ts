import type { CharacterConstellationKit } from "#src/models/character/CharacterConstellationKit";
import type { CharacterSkillKit } from "#src/models/character/CharacterSkillKit";

import { Element } from "#src/models/Element";
import { getTravelerConstellations } from "#src/services/character/getTravelerConstellations";
import { describe, expect, test } from "vitest";

describe(getTravelerConstellations, () => {
  const ELECTRO_DEPOT_ID = 1;
  const PYRO_DEPOT_ID = 2;
  const CONSTELLATION = { descriptionTextId: "1", nameTextId: "1", paramList: [] };
  const STELLA_FORTUNA = { itemId: 1, nameTextId: "1" };
  const CONSTELLATION_KIT: CharacterConstellationKit = {
    characterId: 1,
    depots: [
      { constellations: [CONSTELLATION], depotId: ELECTRO_DEPOT_ID, stellaFortuna: STELLA_FORTUNA },
      {
        constellations: [{ ...CONSTELLATION, nameTextId: "2" }],
        depotId: PYRO_DEPOT_ID,
        stellaFortuna: { ...STELLA_FORTUNA, itemId: 2 },
      },
    ],
  };
  const SKILL_KIT: CharacterSkillKit = {
    characterId: 1,
    depots: [
      { burst: { cooldownSeconds: 1, element: Element.Electro, energyCost: 1 }, depotId: ELECTRO_DEPOT_ID },
      { burst: { cooldownSeconds: 1, element: Element.Pyro, energyCost: 1 }, depotId: PYRO_DEPOT_ID },
    ],
  };

  test("the Traveler's set follows the resonated statue's element", () => {
    expect.hasAssertions();

    expect(
      getTravelerConstellations(CONSTELLATION_KIT, SKILL_KIT, Element.Electro, new Set([Element.Electro])),
    ).toStrictEqual([CONSTELLATION]);
  });

  test("a Traveler set stays locked until its source is done", () => {
    expect.hasAssertions();

    expect(getTravelerConstellations(CONSTELLATION_KIT, SKILL_KIT, Element.Pyro, new Set())).toBeUndefined();
  });
});

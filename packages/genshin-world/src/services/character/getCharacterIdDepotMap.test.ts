import type { ConstellationDepot } from "#src/models/character/ConstellationDepot";

import { getCharacterIdDepotMap } from "#src/services/character/getCharacterIdDepotMap";
import { describe, expect, test } from "vitest";

const createDepot = (depotId: number): ConstellationDepot => ({
  constellations: [],
  depotId,
  stellaFortuna: { itemId: 1, nameTextId: "name" },
});

describe(getCharacterIdDepotMap, () => {
  const CHARACTER_ID = 1001;
  const TRAVELER_ID = 1002;

  test("a character with one set has it and one with a set for each element has none", () => {
    expect.hasAssertions();

    const depot = createDepot(1);
    const depotMap = getCharacterIdDepotMap([
      { characterId: CHARACTER_ID, depots: [depot] },
      { characterId: TRAVELER_ID, depots: [createDepot(2), createDepot(3)] },
    ]);

    expect(depotMap).toStrictEqual(new Map([[CHARACTER_ID, depot]]));
  });
});

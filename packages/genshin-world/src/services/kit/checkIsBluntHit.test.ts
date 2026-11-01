import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { checkIsBluntHit } from "#src/services/kit/checkIsBluntHit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(checkIsBluntHit, () => {
  const GEO_WIELDER = { element: Element.Geo };
  const PYRO_WIELDER = { element: Element.Pyro };
  const hit: KitHit = {
    hitArea: { angle: 2 * Math.PI, height: 2, radius: 1 },
    hitmarkSeconds: 0,
    poiseDamage: 1,
    talentMultiplier: 1,
  };

  test("a hit whose record flags it blunt is blunt, whatever its wielder's element", () => {
    expect.hasAssertions();

    expect(checkIsBluntHit(PYRO_WIELDER, { ...hit, element: Element.Pyro, isBlunt: true })).toBe(true);
    expect(checkIsBluntHit(PYRO_WIELDER, { ...hit, element: Element.Pyro })).toBe(false);
  });

  test("a hit naming its element is not blunt for a Geo wielder, and an excepted Geo hit stays non-blunt", () => {
    expect.hasAssertions();

    expect(checkIsBluntHit(GEO_WIELDER, { ...hit, element: Element.Pyro, gauge: 1 })).toBe(false);
    expect(checkIsBluntHit(GEO_WIELDER, { ...hit, element: Element.Geo, gauge: 1 })).toBe(false);
  });

  test("a hit naming no element of its own is blunt for a Geo wielder, and not for another", () => {
    expect.hasAssertions();

    expect(checkIsBluntHit(GEO_WIELDER, { ...hit, gauge: 1 })).toBe(true);
    expect(checkIsBluntHit(PYRO_WIELDER, { ...hit, gauge: 1 })).toBe(false);
  });

  test("a physical hit is not blunt for a Geo wielder, as it deals no element", () => {
    expect.hasAssertions();

    expect(checkIsBluntHit(GEO_WIELDER, hit)).toBe(false);
  });

  test("a geo traveler's skill, which takes its wielder's element, is blunt, an anemo one is not", () => {
    expect.hasAssertions();

    const skill = takeOne(TRAVELER_KIT.elementalSkill.hits, 0);

    expect(checkIsBluntHit(GEO_WIELDER, skill)).toBe(true);
    expect(checkIsBluntHit({ element: Element.Anemo }, skill)).toBe(false);
  });
});

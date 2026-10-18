import type { CharacterData } from "#src/models/character/CharacterData";

import { BodyType } from "#src/models/character/BodyType";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { getNewCharacters } from "#src/services/wish/getNewCharacters";
import { describe, expect, test } from "vitest";

// A character's data as the tables hold it, with the rest of its fields left empty since the join reads only its weapon
const createCharacterData = (id: number): CharacterData => ({
  ascensionPhases: [],
  attributeLines: [],
  bodyType: BodyType.MediumFemale,
  growAttributes: [],
  id,
  initialWeaponId: id * 10,
  nameTextId: "a",
  rarity: 5,
  weaponType: WeaponType.Bow,
});

describe(getNewCharacters, () => {
  test("a new character joins the roster", () => {
    expect.hasAssertions();

    const characterDataMap = new Map([
      [2, createCharacterData(2)],
      [3, createCharacterData(3)],
    ]);

    // Character 1 was held before the set and only gains a copy, so the two drawn for the first time join in the order drawn
    const newCharacters = getNewCharacters(
      new Map([[1, 1]]),
      new Map([
        [1, 2],
        [2, 1],
        [3, 1],
      ]),
      characterDataMap,
    );

    expect(newCharacters.map(({ id }) => id)).toStrictEqual([2, 3]);
  });
});

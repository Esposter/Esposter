import type { CharacterData } from "#src/models/character/CharacterData";
import type { CharacterSave } from "#src/models/character/CharacterSave";

import { BodyType } from "#src/models/character/BodyType";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { setCharacterLevel } from "#src/services/dev/commands/setCharacterLevel";
import { TALENT_START_LEVELS } from "#src/services/character/constants";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { describe, expect, test } from "vitest";

describe(setCharacterLevel, () => {
  const CHARACTER_ID = 1;
  const CHARACTER_NAME = "Amber";
  const CHARACTER_NAME_TEXT_ID = "1";
  const FIRST_PHASE_MAX_LEVEL = 20;
  const LEVEL = 5;
  const characterData: CharacterData = {
    ascensionPhases: [
      { attributeLines: [], maxLevel: FIRST_PHASE_MAX_LEVEL },
      { attributeLines: [], maxLevel: 40 },
    ],
    attributeLines: [],
    bodyType: BodyType.ShortFemale,
    growAttributes: [],
    id: CHARACTER_ID,
    initialWeaponId: 1,
    nameTextId: CHARACTER_NAME_TEXT_ID,
    rarity: 4,
    weaponType: WeaponType.Bow,
  };
  const character: CharacterSave = {
    artifacts: [],
    ascension: 0,
    constellationCount: 0,
    copyCount: 0,
    id: CHARACTER_ID,
    level: 1,
    stellaFortunaCount: 0,
    talentLevels: TALENT_START_LEVELS,
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };
  const save = { ...EMPTY_GENSHIN_SAVE, characters: [character] };
  const tables = {
    characterDataMap: new Map([[CHARACTER_ID, characterData]]),
    nameText: { [CHARACTER_NAME_TEXT_ID]: CHARACTER_NAME },
  };

  test("each writes the same save field the game's own act writes", () => {
    expect.hasAssertions();

    expect(setCharacterLevel(save, { character: CHARACTER_NAME, level: LEVEL }, tables)).toStrictEqual({
      ok: true,
      save: { ...EMPTY_GENSHIN_SAVE, characters: [{ ...character, level: LEVEL }] },
      value: LEVEL,
    });
  });

  test("a level past the highest its ascension allows is clamped to that level", () => {
    expect.hasAssertions();

    expect(setCharacterLevel(save, { character: CHARACTER_NAME, level: 99 }, tables)).toStrictEqual({
      ok: true,
      save: { ...EMPTY_GENSHIN_SAVE, characters: [{ ...character, level: FIRST_PHASE_MAX_LEVEL }] },
      value: FIRST_PHASE_MAX_LEVEL,
    });
  });
});

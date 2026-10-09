import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { WeaponType } from "#src/models/weapon/WeaponType";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { toGenshinSave } from "#src/services/save/toGenshinSave";
import { ItemCategory } from "genshin-interface";
import { BannerKind } from "genshin-interface/save";
import { describe, expect, test } from "vitest";

describe(readGenshinSave, () => {
  const ACHIEVEMENT_ID = "5";
  const FINISHED_AT = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }).toString();
  const ADVENTURE_EXP = 1200;
  const CHARACTER_ID = "6";
  const COMPANIONSHIP_EXP = 300;
  const REPUTATION = { exp: 150, level: 2 };
  // A weapon forged from a recipe and one drawn from a wish, each in the bag as an entry of its own
  const FORGED_WEAPON_ID = 13_401;
  const FORGED_NAME_TEXT_ID = "1";
  const WISHED_WEAPON_ID = 11_101;
  const WISHED_NAME_TEXT_ID = "2";
  const NAMES = { [FORGED_NAME_TEXT_ID]: "Forged", [WISHED_NAME_TEXT_ID]: "Wished" };
  const WEAPON_DATA_MAP = new Map<number, WeaponData>([
    [
      FORGED_WEAPON_ID,
      {
        ascensionPhases: [],
        baseExp: 0,
        growAttributes: [],
        id: FORGED_WEAPON_ID,
        nameTextId: FORGED_NAME_TEXT_ID,
        rarity: 4,
        refinementCosts: [],
        refinementMaterialId: 0,
        weaponType: WeaponType.Claymore,
      },
    ],
    [
      WISHED_WEAPON_ID,
      {
        ascensionPhases: [],
        baseExp: 0,
        growAttributes: [],
        id: WISHED_WEAPON_ID,
        nameTextId: WISHED_NAME_TEXT_ID,
        rarity: 3,
        refinementCosts: [],
        refinementMaterialId: 0,
        weaponType: WeaponType.Sword,
      },
    ],
  ]);
  const WISH_COUNT = 3;
  const LANDMARK_ID = "1";
  const QUEST_ID = "3";
  const POPULATED_SAVE: GenshinSave = {
    ...EMPTY_GENSHIN_SAVE,
    achievements: { [ACHIEVEMENT_ID]: { count: 1, finishedAt: FINISHED_AT } },
    adventureExp: ADVENTURE_EXP,
    companionshipExp: { [CHARACTER_ID]: COMPANIONSHIP_EXP },
    inventory: {
      items: [
        { id: 0, itemId: FORGED_WEAPON_ID, level: 1, quantity: 1 },
        { id: 1, itemId: WISHED_WEAPON_ID, level: 1, quantity: 1 },
      ],
      nextId: 2,
    },
    quests: { [QUEST_ID]: { objectiveCounts: [1], stepIndex: 1 } },
    reputation: REPUTATION,
    unlockedLandmarks: [LANDMARK_ID],
    wishPity: {
      ...EMPTY_GENSHIN_SAVE.wishPity,
      [BannerKind.Standard]: { ...EMPTY_GENSHIN_SAVE.wishPity[BannerKind.Standard], wishCount: WISH_COUNT },
    },
  };

  test("reads a save back to the same save once written", () => {
    expect.hasAssertions();
    expect(toGenshinSave(readGenshinSave(EMPTY_GENSHIN_SAVE, NAMES, WEAPON_DATA_MAP))).toStrictEqual(
      EMPTY_GENSHIN_SAVE,
    );
  });

  test("reads every system a save holds back to the same save once written", () => {
    expect.hasAssertions();
    expect(toGenshinSave(readGenshinSave(POPULATED_SAVE, NAMES, WEAPON_DATA_MAP))).toStrictEqual(POPULATED_SAVE);
  });

  test("reads a bag's forged and wished weapons back as weapons, each named and rarity from its own data", () => {
    expect.hasAssertions();
    expect(readGenshinSave(POPULATED_SAVE, NAMES, WEAPON_DATA_MAP).inventory).toStrictEqual({
      items: [
        {
          definition: {
            category: ItemCategory.Weapon,
            id: FORGED_WEAPON_ID,
            name: NAMES[FORGED_NAME_TEXT_ID],
            rank: 0,
            rarity: 4,
            stackLimit: 1,
          },
          id: 0,
          level: 1,
          quantity: 1,
        },
        {
          definition: {
            category: ItemCategory.Weapon,
            id: WISHED_WEAPON_ID,
            name: NAMES[WISHED_NAME_TEXT_ID],
            rank: 0,
            rarity: 3,
            stackLimit: 1,
          },
          id: 1,
          level: 1,
          quantity: 1,
        },
      ],
      nextId: 2,
    });
  });
});

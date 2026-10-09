import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { toGenshinSave } from "#src/services/save/toGenshinSave";
import { ItemCategory } from "genshin-interface";
import { BannerKind } from "genshin-interface/save";
import { describe, expect, test } from "vitest";

const ACHIEVEMENT_ID = "5";
const FINISHED_AT = "2026-10-09T01:00:00Z";
const ADVENTURE_EXP = 1200;
const CHARACTER_ID = "6";
const COMPANIONSHIP_EXP = 300;
const REPUTATION = { exp: 150, level: 2 };
const WEAPON_ITEM_ID = 13_401;
const WISH_COUNT = 3;
const LANDMARK_ID = "1";
const QUEST_ID = "3";
// The bag's names come from the game's tables, so the round trip stubs them by id alone
const getItemDefinition = (itemId: number): ItemDefinition => ({
  category: ItemCategory.Weapon,
  id: itemId,
  name: "",
  rank: 0,
  rarity: 4,
  stackLimit: 1,
});
const POPULATED_SAVE: GenshinSave = {
  ...EMPTY_GENSHIN_SAVE,
  achievements: { [ACHIEVEMENT_ID]: { count: 1, finishedAt: FINISHED_AT } },
  adventureExp: ADVENTURE_EXP,
  companionshipExp: { [CHARACTER_ID]: COMPANIONSHIP_EXP },
  inventory: { items: [{ id: 0, itemId: WEAPON_ITEM_ID, level: 1, quantity: 1 }], nextId: 1 },
  quests: { [QUEST_ID]: { objectiveCounts: [1], stepIndex: 1 } },
  reputation: REPUTATION,
  unlockedLandmarks: [LANDMARK_ID],
  wishPity: {
    ...EMPTY_GENSHIN_SAVE.wishPity,
    [BannerKind.Standard]: { ...EMPTY_GENSHIN_SAVE.wishPity[BannerKind.Standard], wishCount: WISH_COUNT },
  },
};

describe(readGenshinSave, () => {
  test("reads a save back to the same save once written", () => {
    expect.hasAssertions();
    expect(toGenshinSave(readGenshinSave(EMPTY_GENSHIN_SAVE, getItemDefinition))).toStrictEqual(EMPTY_GENSHIN_SAVE);
  });

  test("reads every system a save holds back to the same save once written", () => {
    expect.hasAssertions();
    expect(toGenshinSave(readGenshinSave(POPULATED_SAVE, getItemDefinition))).toStrictEqual(POPULATED_SAVE);
  });
});

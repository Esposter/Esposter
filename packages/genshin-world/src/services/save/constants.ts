import type { InventorySave } from "#src/models/inventory/InventorySave";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import achievementCount from "#src/data/achievements/achievementCount.json";
import { Currency } from "#src/models/inventory/Currency";
import { INVENTORY_KIND_LIMIT, MAX_ITEM_QUANTITY } from "#src/services/inventory/bagLimits";
import { ItemCategoryRoomMap } from "#src/services/inventory/ItemCategoryRoomMap";
import { ORIGINAL_RESIN_CAP } from "#src/services/originalResin/constants";
import { InitialBannerKindWishPityMap } from "#src/services/wish/InitialBannerKindWishPityMap";
import { BannerKind } from "genshin-interface/save";

// A save's ids are the game's own, short and fixed, so one bound serves every id a slice holds
export const MAX_SAVE_ID_LENGTH = 64;
// The most of each list a save may hold: a landmark or quest is unique, and a player holds fewer characters
// Than the bound
export const MAX_UNLOCKED_LANDMARK_COUNT = 512;
export const MAX_QUEST_COUNT = 512;
export const MAX_OBJECTIVE_COUNT = 16;
export const MAX_CHARACTER_COUNT = 512;
// The bench's recipes are the combine table's rows, each named by its id once in the learned list and once in the counts
export const MAX_CRAFTING_RECIPE_COUNT = 512;
// The game's achievement table keeps this many achievements, counted by `genshin:assets achievements` into the
// World's data
export const MAX_ACHIEVEMENT_COUNT: number = achievementCount.count;
// The bag holds up to its kinds of item beside its rooms for weapons, artifacts and furnishings, where each piece is
// An entry of its own, so its entries are at most the kinds plus the rooms the wiki's Inventory page gives
export const MAX_INVENTORY_ITEM_COUNT: number =
  INVENTORY_KIND_LIMIT + Object.values(ItemCategoryRoomMap).reduce((total, room) => total + (room ?? 0), 0);
// The longest instant a save holds: Temporal's own string at its nanosecond, Z-suffixed, which the schemas bound to
// This length
const MAX_SAVE_INSTANT = "9999-12-31T23:59:59.999999999Z";
export const MAX_SAVE_INSTANT_LENGTH: number = MAX_SAVE_INSTANT.length;
// The longest number and id a save holds: the largest safe integer every integer's schema admits, and an id at
// Its bound
const MAX_SAVE_NUMBER = Number.MAX_SAFE_INTEGER;
const MAX_SAVE_ID = "x".repeat(MAX_SAVE_ID_LENGTH);
// The serialized length of a record's entry at its longest, its key at the id bound, with the comma that follows it
const getRecordEntryLength = (value: unknown): number => JSON.stringify({ [MAX_SAVE_ID]: value }).length - 1;
// The serialized length of a list's entry at its longest, with the comma that follows it
const getListEntryLength = (value: unknown): number => JSON.stringify(value).length + 1;
// The save at its longest outside its collections: every number at its largest, every instant at its longest and every
// Collection empty, so the ceiling below adds only the entries of each collection
const SKELETON_GENSHIN_SAVE_LENGTH = JSON.stringify({
  achievements: {},
  adventureExp: MAX_SAVE_NUMBER,
  companionshipExp: {},
  crafting: { craftedCounts: {}, learnedRecipeIds: [] },
  inventory: { items: [], nextId: MAX_SAVE_NUMBER },
  quests: {},
  reputation: { exp: MAX_SAVE_NUMBER, level: MAX_SAVE_NUMBER },
  unlockedLandmarks: [],
  wallet: {
    currencies: Object.fromEntries(Object.values(Currency).map((currency) => [currency, MAX_SAVE_NUMBER])),
    originalResinChangedAt: MAX_SAVE_INSTANT,
    primogemResinRefillCount: MAX_SAVE_NUMBER,
    primogemResinRefillDay: "9999-12-31",
  },
  wishPity: Object.fromEntries(
    Object.values(BannerKind).map((bannerKind) => [
      bannerKind,
      {
        chartedWeaponId: MAX_SAVE_NUMBER,
        fatePoints: MAX_SAVE_NUMBER,
        fiveStarCount: MAX_SAVE_NUMBER,
        fourStarCount: MAX_SAVE_NUMBER,
        isFiveStarGuaranteed: false,
        isFourStarGuaranteed: false,
        lossCount: MAX_SAVE_NUMBER,
        wishCount: MAX_SAVE_NUMBER,
      },
    ]),
  ),
}).length;
// The serialized save's ceiling, so a crafted document cannot grow the blob without limit: the skeleton, then each
// Collection at its cap times its longest entry. Each id is counted at its bound's length, since the game's ids are
// Plain characters, so an id that escapes to a longer serialization is refused by the same ceiling
export const MAX_GENSHIN_SAVE_LENGTH: number =
  SKELETON_GENSHIN_SAVE_LENGTH +
  MAX_ACHIEVEMENT_COUNT * getRecordEntryLength({ count: MAX_SAVE_NUMBER, finishedAt: MAX_SAVE_INSTANT }) +
  MAX_CHARACTER_COUNT * getRecordEntryLength(MAX_SAVE_NUMBER) +
  MAX_CRAFTING_RECIPE_COUNT * (getRecordEntryLength(MAX_SAVE_NUMBER) + getListEntryLength(MAX_SAVE_NUMBER)) +
  MAX_QUEST_COUNT *
    getRecordEntryLength({
      objectiveCounts: Array.from({ length: MAX_OBJECTIVE_COUNT }, () => MAX_SAVE_NUMBER),
      stepIndex: MAX_SAVE_NUMBER,
    }) +
  MAX_UNLOCKED_LANDMARK_COUNT * getListEntryLength(MAX_SAVE_ID) +
  MAX_INVENTORY_ITEM_COUNT *
    getListEntryLength({
      id: MAX_SAVE_NUMBER,
      itemId: MAX_SAVE_NUMBER,
      level: MAX_SAVE_NUMBER,
      quantity: MAX_ITEM_QUANTITY,
    });
// A new player's bag, which holds nothing until the world gives it something
export const EMPTY_INVENTORY_SAVE: InventorySave = { items: [], nextId: 0 };
// Mondstadt's Reputation at its first level, with no EXP toward the next
export const EMPTY_REPUTATION_SAVE: ReputationProgress = { exp: 0, level: 1 };
// A new player's save: the wallet as a new player's holds it, its Original Resin at the cap from the epoch, and nothing
// Else. The instants are ISO strings, as the save stores them
export const EMPTY_GENSHIN_SAVE: GenshinSave = {
  achievements: {},
  adventureExp: 0,
  companionshipExp: {},
  crafting: { craftedCounts: {}, learnedRecipeIds: [] },
  inventory: EMPTY_INVENTORY_SAVE,
  quests: {},
  reputation: EMPTY_REPUTATION_SAVE,
  unlockedLandmarks: [],
  wallet: {
    currencies: {
      [Currency.AcquaintFate]: 0,
      [Currency.GenesisCrystal]: 0,
      [Currency.IntertwinedFate]: 0,
      [Currency.MasterlessStardust]: 0,
      [Currency.MasterlessStarglitter]: 0,
      [Currency.MasterlessStellaFortuna]: 0,
      [Currency.Mora]: 0,
      [Currency.OriginalResin]: ORIGINAL_RESIN_CAP,
      [Currency.Primogem]: 0,
    },
    originalResinChangedAt: "1970-01-01T00:00:00Z",
    primogemResinRefillCount: 0,
    primogemResinRefillDay: "1970-01-01",
  },
  wishPity: InitialBannerKindWishPityMap,
};

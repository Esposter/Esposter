import type { InventorySave } from "#src/models/inventory/InventorySave";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import { Currency } from "#src/models/inventory/Currency";
import { ORIGINAL_RESIN_CAP } from "#src/services/originalResin/constants";
import { InitialBannerKindWishPityMap } from "#src/services/wish/InitialBannerKindWishPityMap";

// A save's ids are the game's own, short and fixed, so one bound serves every id a slice holds
export const MAX_SAVE_ID_LENGTH = 64;
// The most of each list a save may hold: a landmark or quest is unique, so the game's own count is far below these
export const MAX_UNLOCKED_LANDMARK_COUNT = 512;
export const MAX_QUEST_COUNT = 512;
export const MAX_OBJECTIVE_COUNT = 16;
// The game's achievement table holds fewer than this, and a player holds fewer characters than the second bound
export const MAX_ACHIEVEMENT_COUNT = 2048;
export const MAX_CHARACTER_COUNT = 512;
// The bag's entries: its kinds of item, and each weapon and artifact on its own, so it holds more than its stacks alone
export const MAX_INVENTORY_ITEM_COUNT = 4096;
// The serialized save's ceiling, so a crafted document cannot grow the blob without limit
export const MAX_GENSHIN_SAVE_LENGTH = 262_144;
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

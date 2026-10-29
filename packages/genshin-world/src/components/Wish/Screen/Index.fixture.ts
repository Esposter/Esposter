import type { Wallet } from "#src/models/inventory/Wallet";

import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { readStatTables } from "#src/services/character/readStatTables";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { BEGINNERS_WISH_LIMIT, INITIAL_WISH_PITY } from "#src/services/wish/constants";
import { InitialBannerKindWishPityMap } from "#src/services/wish/InitialBannerKindWishPityMap";
import { readWishSchedule } from "#src/services/wish/readWishSchedule";
import { BannerKind } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const wishSchedule = await readWishSchedule(GAME_DATA_LOCAL_BASE_URL);

// The Character Event banner open on Born of Ocean Swell, the English PC client's wish screen at 78 seconds of the public
// 1080p recording: 539 Primogems and 32 Intertwined Fates held, with no wish yet made on it
const wallet: Wallet = { ...EMPTY_WALLET, [Currency.IntertwinedFate]: 32, [Currency.Primogem]: 539 };
// The account's beginners' wish is spent, so the Character Event banner is the first on offer
const pityMap = {
  ...InitialBannerKindWishPityMap,
  [BannerKind.Beginners]: { ...INITIAL_WISH_PITY, wishCount: BEGINNERS_WISH_LIMIT },
};

// The clock held in Born of Ocean Swell's window as the recording shows it: six days, twelve hours and fifteen minutes
// Before the window closes at 2021-06-08 06:59:59 UTC, so the screen counts down the time the recording shows
const heldNow = Temporal.Instant.from("2021-06-01T18:44:59Z");

export const props = {
  characterCopyCountMap: new Map<number, number>(),
  characters: [],
  gameText: ENGLISH_GAME_TEXT,
  getWorldNow: () => heldNow,
  inventory: EMPTY_INVENTORY,
  nameText: englishNameText,
  now: heldNow,
  pityMap,
  statTables,
  stellaFortunaNameTextIdMap: new Map<number, string>(),
  // The reference shows no trial button, and no wish is yet made on the banner, so the history is empty
  trials: [],
  wallet,
  wishHistory: [],
  wishSchedule,
};

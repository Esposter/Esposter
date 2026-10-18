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

// The wallet the English PC client's wish screen shows at 78 seconds of the public
// 1080p recording: 539 Primogems and 32 Intertwined Fates held, with no wish yet made on it
const wallet: Wallet = { ...EMPTY_WALLET, [Currency.IntertwinedFate]: 32, [Currency.Primogem]: 539 };
// The account's beginners' wish is spent, so the Character Event banner is the first on offer
const pityMap = {
  ...InitialBannerKindWishPityMap,
  [BannerKind.Beginners]: { ...INITIAL_WISH_PITY, wishCount: BEGINNERS_WISH_LIMIT },
};

export const props = {
  characterCopyCountMap: new Map<number, number>(),
  characters: [],
  gameText: ENGLISH_GAME_TEXT,
  inventory: EMPTY_INVENTORY,
  nameText: englishNameText,
  pityMap,
  // The clock held at 2026-09-24, a day into When Warm Winds Cavort's window, the first Character Event banner open then.
  // The published schedule lists no featured five-star Character for the banners before 2024, so the clock stays in 2026.
  serverClockOffsetMs:
    Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 497_283 }).epochMilliseconds -
    Temporal.Now.instant().epochMilliseconds,
  statTables,
  stellaFortunaNameTextIdMap: new Map<number, string>(),
  wallet,
  wishSchedule,
};

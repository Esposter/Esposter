import type { ResinParam } from "#src/models/originalResin/ResinParam";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";

// A new player's save: the empty save with its Original Resin at the game's regeneration cap, which the record of the
// Original Resin constants gives. The record is awaited where a save is made, so no stored save holds a game figure it
// Did not read from the game
export const createStartingGenshinSave = (resinParam: ResinParam): GenshinSave => ({
  ...EMPTY_GENSHIN_SAVE,
  wallet: {
    ...EMPTY_GENSHIN_SAVE.wallet,
    currencies: { ...EMPTY_GENSHIN_SAVE.wallet.currencies, [Currency.OriginalResin]: resinParam.originalResinCap },
  },
});

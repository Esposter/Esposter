import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { ORIGINAL_RESIN_REFILL_CAP } from "#src/services/originalResin/constants";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";

// The wallet with `resin` added to its Original Resin at `now`, filling to the refill cap. A refill may pass the
// Regeneration cap, and then the resin stops regenerating
export const refillOriginalResin = (wallet: Wallet, resin: number, now: Temporal.Instant): Wallet => {
  const regeneratedWallet = regenerateOriginalResin(wallet, now);
  return {
    ...regeneratedWallet,
    [Currency.OriginalResin]: Math.min(ORIGINAL_RESIN_REFILL_CAP, regeneratedWallet[Currency.OriginalResin] + resin),
  };
};

import type { Wallet } from "#src/models/inventory/Wallet";
import type { ResinParam } from "#src/models/originalResin/ResinParam";

import { Currency } from "#src/models/inventory/Currency";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";

// The wallet with `resin` added to its Original Resin at `now`, filling to the refill cap. A refill may pass the
// Regeneration cap, and then the resin stops regenerating
export const refillOriginalResin = (
  wallet: Wallet,
  resin: number,
  now: Temporal.Instant,
  resinParam: ResinParam,
): Wallet => {
  const regeneratedWallet = regenerateOriginalResin(wallet, now, resinParam);
  return {
    ...regeneratedWallet,
    [Currency.OriginalResin]: Math.min(
      resinParam.originalResinRefillCap,
      regeneratedWallet[Currency.OriginalResin] + resin,
    ),
  };
};

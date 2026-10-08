import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { ORIGINAL_RESIN_CAP, ORIGINAL_RESIN_REGEN_MINUTES } from "#src/services/originalResin/constants";

// The wallet with its Original Resin regenerated to `now`: a point each regeneration interval while it is below the cap.
// The moment it last changed moves on by the points that came, so the time to the next one keeps its place. At the
// Cap regeneration stops and the moment is `now`, so a spend that takes the resin below the cap starts the next point there
export const regenerateOriginalResin = (wallet: Wallet, now: Temporal.Instant): Wallet => {
  const originalResin = wallet[Currency.OriginalResin];
  if (originalResin >= ORIGINAL_RESIN_CAP) return { ...wallet, originalResinChangedAt: now };
  const elapsedMinutes = wallet.originalResinChangedAt.until(now, { largestUnit: "minutes" }).minutes;
  const regeneratedPoints = Math.min(
    Math.max(0, Math.floor(elapsedMinutes / ORIGINAL_RESIN_REGEN_MINUTES)),
    ORIGINAL_RESIN_CAP - originalResin,
  );
  const regeneratedOriginalResin = originalResin + regeneratedPoints;
  return {
    ...wallet,
    [Currency.OriginalResin]: regeneratedOriginalResin,
    originalResinChangedAt:
      regeneratedOriginalResin >= ORIGINAL_RESIN_CAP
        ? now
        : wallet.originalResinChangedAt.add({ minutes: regeneratedPoints * ORIGINAL_RESIN_REGEN_MINUTES }),
  };
};

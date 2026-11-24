import type { Wallet } from "#src/models/inventory/Wallet";
import type { ResinParam } from "#src/models/originalResin/ResinParam";

import { Currency } from "#src/models/inventory/Currency";

// The wallet with its Original Resin regenerated to `now`: a point each regeneration interval while it is below
// The cap. The moment it last changed moves on by the points that came, so the time to the next one keeps its place. At
// The
// Cap regeneration stops and the moment is `now`, so a spend that takes the resin below the cap starts the next point
// There
export const regenerateOriginalResin = (wallet: Wallet, now: Temporal.Instant, resinParam: ResinParam): Wallet => {
  const cap = resinParam.originalResinCap;
  const regenMinutes = resinParam.originalResinRegenMinutes;
  const originalResin = wallet[Currency.OriginalResin];
  if (originalResin >= cap) return { ...wallet, originalResinChangedAt: now };
  const elapsedMinutes = wallet.originalResinChangedAt.until(now, { largestUnit: "minutes" }).minutes;
  const regeneratedPoints = Math.min(Math.max(0, Math.floor(elapsedMinutes / regenMinutes)), cap - originalResin);
  const regeneratedOriginalResin = originalResin + regeneratedPoints;
  return {
    ...wallet,
    [Currency.OriginalResin]: regeneratedOriginalResin,
    originalResinChangedAt:
      regeneratedOriginalResin >= cap
        ? now
        : wallet.originalResinChangedAt.add({ minutes: regeneratedPoints * regenMinutes }),
  };
};

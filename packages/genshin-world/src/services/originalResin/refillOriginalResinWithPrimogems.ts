import type { Wallet } from "#src/models/inventory/Wallet";
import type { ResinParam } from "#src/models/originalResin/ResinParam";

import { Currency } from "#src/models/inventory/Currency";
import { refillOriginalResin } from "#src/services/originalResin/refillOriginalResin";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";
import { computeGameDay } from "#src/services/time/computeGameDay";

// The wallet after Original Resin is refilled with Primogems at `now`, or undefined where the refills are used up.
// The Primogems held fall short of the next price, or the Original Resin held is above the cap less one refill.
// The game refuses either case.
// The day's refills count from the game's day, which starts at its hour in the game's time zone.
// They restart when that day changes.
export const refillOriginalResinWithPrimogems = (
  wallet: Wallet,
  now: Temporal.Instant,
  resinParam: ResinParam,
): undefined | Wallet => {
  const gameDay = computeGameDay(now);
  const refillCount = wallet.primogemResinRefillDay.equals(gameDay) ? wallet.primogemResinRefillCount : 0;
  const price = resinParam.primogemResinRefillPrices[refillCount];
  const originalResin = regenerateOriginalResin(wallet, now, resinParam)[Currency.OriginalResin];
  if (
    price === undefined ||
    wallet[Currency.Primogem] < price ||
    originalResin + resinParam.primogemResinRestore > resinParam.originalResinRefillCap
  )
    return undefined;
  return {
    ...refillOriginalResin(wallet, resinParam.primogemResinRestore, now, resinParam),
    [Currency.Primogem]: wallet[Currency.Primogem] - price,
    primogemResinRefillCount: refillCount + 1,
    primogemResinRefillDay: gameDay,
  };
};

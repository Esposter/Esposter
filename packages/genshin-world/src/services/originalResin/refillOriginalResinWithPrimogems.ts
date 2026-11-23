import type { Wallet } from "#src/models/inventory/Wallet";
import type { ResinParam } from "#src/models/originalResin/ResinParam";

import { Currency } from "#src/models/inventory/Currency";
import { refillOriginalResin } from "#src/services/originalResin/refillOriginalResin";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";
import { computeGameDay } from "#src/services/time/computeGameDay";

// The wallet after Original Resin is refilled with Primogems at `now`, or undefined where the day's refills are used
// Up. The Primogems held fall short of the next price, or the refill would pass the refill cap, as the game refuses it
// Above The cap less one refill. The day's refills count From the game's day, which starts at its hour in the game's
// Time zone, and restart when that day changes
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

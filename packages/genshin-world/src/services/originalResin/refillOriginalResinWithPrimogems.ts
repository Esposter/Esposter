import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import {
  GAME_DAY_START_HOUR,
  GAME_TIME_ZONE,
  ORIGINAL_RESIN_REFILL_CAP,
  PRIMOGEM_RESIN_REFILL_PRICES,
  PRIMOGEM_RESIN_RESTORE,
} from "#src/services/originalResin/constants";
import { refillOriginalResin } from "#src/services/originalResin/refillOriginalResin";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";

// The wallet after Original Resin is refilled with Primogems at `now`, or undefined where the day's refills are used up.
// The Primogems held fall short of the next price, or the resin is at the refill cap already. The day's refills count
// From the game's day, which starts at its hour in the game's time zone, and restart when that day changes
export const refillOriginalResinWithPrimogems = (wallet: Wallet, now: Temporal.Instant): undefined | Wallet => {
  const gameDay = now.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ hours: GAME_DAY_START_HOUR }).toPlainDate();
  const refillCount = wallet.primogemResinRefillDay.equals(gameDay) ? wallet.primogemResinRefillCount : 0;
  const price = PRIMOGEM_RESIN_REFILL_PRICES[refillCount];
  const originalResin = regenerateOriginalResin(wallet, now)[Currency.OriginalResin];
  if (price === undefined || wallet[Currency.Primogem] < price || originalResin >= ORIGINAL_RESIN_REFILL_CAP)
    return undefined;
  return {
    ...refillOriginalResin(wallet, PRIMOGEM_RESIN_RESTORE, now),
    [Currency.Primogem]: wallet[Currency.Primogem] - price,
    primogemResinRefillCount: refillCount + 1,
    primogemResinRefillDay: gameDay,
  };
};

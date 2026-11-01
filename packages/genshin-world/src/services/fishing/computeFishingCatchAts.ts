import { checkIsFishingCatchReturned } from "#src/services/fishing/checkIsFishingCatchReturned";
import { getOrCreate } from "@esposter/shared";

// The catches the record holds once a fish is caught from a stock at `now`: each stock's catches not yet back, and the
// Caught fish's catch beside them under its stock's key. A stock with none left not yet back is dropped from the record
export const computeFishingCatchAts = (
  caughtAtMap: ReadonlyMap<string, readonly Temporal.Instant[]>,
  stockKey: string,
  now: Temporal.Instant,
): Map<string, Temporal.Instant[]> => {
  const nextCaughtAtMap = new Map<string, Temporal.Instant[]>();
  for (const [key, caughtAts] of caughtAtMap) {
    const notYetBack = caughtAts.filter((caughtAt) => !checkIsFishingCatchReturned(caughtAt, now));
    if (notYetBack.length > 0) nextCaughtAtMap.set(key, notYetBack);
  }

  getOrCreate(nextCaughtAtMap, stockKey, () => []).push(now);
  return nextCaughtAtMap;
};

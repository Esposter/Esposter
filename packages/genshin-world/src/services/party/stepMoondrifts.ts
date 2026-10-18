import type { Party } from "#src/models/party/Party";

import { runDownSeconds } from "#src/services/runDownSeconds";

// The party's Moondrifts some seconds on, written in place: each one's seconds and the Harmony's cooldown run down, and
// A Moondrift whose seconds ran out is dropped from the list
export const stepMoondrifts = ({ lunarCrystallize }: Party, stepSeconds: number): void => {
  lunarCrystallize.harmonyCooldownSeconds = Math.max(
    0,
    runDownSeconds(lunarCrystallize.harmonyCooldownSeconds, stepSeconds),
  );
  const { moondrifts } = lunarCrystallize;
  let keptCount = 0;
  for (const moondrift of moondrifts) {
    moondrift.secondsRemaining = runDownSeconds(moondrift.secondsRemaining, stepSeconds);
    if (moondrift.secondsRemaining > 0) moondrifts[keptCount++] = moondrift;
  }
  moondrifts.length = keptCount;
};

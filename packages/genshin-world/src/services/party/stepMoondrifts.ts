import type { Party } from "#src/models/party/Party";

// The party's Moondrifts some seconds on, written in place: each one's seconds and the Harmony's cooldown run down, and
// A Moondrift whose seconds ran out is gone
export const stepMoondrifts = ({ lunarCrystallize }: Party, stepSeconds: number): void => {
  lunarCrystallize.harmonyCooldownSeconds = Math.max(0, lunarCrystallize.harmonyCooldownSeconds - stepSeconds);
  for (const moondrift of lunarCrystallize.moondrifts) moondrift.secondsRemaining -= stepSeconds;
  lunarCrystallize.moondrifts = lunarCrystallize.moondrifts.filter(({ secondsRemaining }) => secondsRemaining > 0);
};

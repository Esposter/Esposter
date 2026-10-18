import type { GameClock } from "#src/models/clock/GameClock";

import { MINUTES_PER_DAY } from "#src/clock/constants";

// Moves the day on by a frame's real seconds at the clock's rate, wrapping at midnight and counting each midnight it
// Passes. The clock is written in place, so a frame allocates nothing
export const advanceGameClock = (gameClock: GameClock, deltaSeconds: number): void => {
  const minutes = gameClock.minutes + deltaSeconds * gameClock.minutesPerSecond;
  gameClock.days += Math.floor(minutes / MINUTES_PER_DAY);
  gameClock.minutes = minutes % MINUTES_PER_DAY;
};

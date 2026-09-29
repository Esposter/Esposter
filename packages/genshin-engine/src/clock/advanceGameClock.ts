import type { GameClock } from "#src/clock/GameClock";

import { MINUTES_PER_DAY } from "#src/clock/constants";

// Moves the day on by a frame's real seconds at the clock's rate, wrapping at midnight. The clock is written in place, so a frame
// Allocates nothing
export const advanceGameClock = (gameClock: GameClock, deltaSeconds: number): void => {
  gameClock.minutes = (gameClock.minutes + deltaSeconds * gameClock.minutesPerSecond) % MINUTES_PER_DAY;
};

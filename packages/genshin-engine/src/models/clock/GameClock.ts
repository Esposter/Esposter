// Where the day stands, in in-game minutes past midnight, how many midnights it has passed since the clock began, and how
// Fast it moves: the game's own rate is one minute a real second, zero holds the hour still, and more fast-forwards it
export interface GameClock {
  days: number;
  minutes: number;
  minutesPerSecond: number;
}

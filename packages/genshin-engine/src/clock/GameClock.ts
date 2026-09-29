// Where the day stands, in in-game minutes past midnight, and how fast it moves: the game's own rate is one minute a
// Real second, zero holds the hour still, and more fast-forwards it
export interface GameClock {
  minutes: number;
  minutesPerSecond: number;
}

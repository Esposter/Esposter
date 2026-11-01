// What a challenge's step is told each frame: the time that passed, whether the world is in play for it and whether the
// Party is down
export interface WorldChallengeStep {
  deltaMilliseconds: number;
  isPartyDown: boolean;
  isPlaying: boolean;
}

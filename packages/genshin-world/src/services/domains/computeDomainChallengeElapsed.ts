// The time a challenge has run after a frame: the frame counts only while the world is open, so a menu open spends none of
// The time limit
export const computeDomainChallengeElapsed = (
  elapsedMilliseconds: number,
  deltaMilliseconds: number,
  isPlaying: boolean,
): number => (isPlaying ? elapsedMilliseconds + deltaMilliseconds : elapsedMilliseconds);

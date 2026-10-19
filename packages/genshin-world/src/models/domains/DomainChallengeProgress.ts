// How far a domain's challenge has run: its defeats against the target, and the time it has run against its limit
export interface DomainChallengeProgress {
  defeats: number;
  // The defeats the level asks for, which its waves spawn in full
  defeatTarget: number;
  // The milliseconds the challenge has run, counted only while the world is open
  elapsedMilliseconds: number;
  timeLimitMilliseconds: number;
}

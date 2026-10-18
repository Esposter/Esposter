import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";

export interface DomainChallengeProgress {
  // The defeats the level asks for, which its waves spawn in full
  defeatTarget: number;
  defeats: number;
  // The milliseconds the challenge has run, counted only while the world is open
  elapsedMilliseconds: number;
  timeLimitMilliseconds: number;
}

// How a challenge stands at a moment: a clear is the defeats reaching the target, then the party going down, then the
// Time running out. A challenge with none of them is still running
export const resolveDomainChallenge = (
  { defeatTarget, defeats, elapsedMilliseconds, timeLimitMilliseconds }: DomainChallengeProgress,
  { partyDown }: { partyDown: boolean },
): DomainChallengeOutcome => {
  if (defeats >= defeatTarget) return DomainChallengeOutcome.Cleared;
  if (partyDown) return DomainChallengeOutcome.Wiped;
  if (elapsedMilliseconds >= timeLimitMilliseconds) return DomainChallengeOutcome.TimedOut;
  return DomainChallengeOutcome.Running;
};

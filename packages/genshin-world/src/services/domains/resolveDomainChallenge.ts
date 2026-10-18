import type { DomainChallengeProgress } from "#src/models/domains/DomainChallengeProgress";

import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";

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

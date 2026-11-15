// How a domain's challenge stands: cleared, still running, run out of time, or every member of the party down
export const DomainChallengeOutcome = {
  Cleared: "Cleared",
  Running: "Running",
  TimedOut: "TimedOut",
  Wiped: "Wiped",
} as const;
export type DomainChallengeOutcome = (typeof DomainChallengeOutcome)[keyof typeof DomainChallengeOutcome];

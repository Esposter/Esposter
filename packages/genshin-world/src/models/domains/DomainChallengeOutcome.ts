// How a domain's challenge stands: cleared, still running, run out of time, or every member of the party down
export enum DomainChallengeOutcome {
  Cleared = "Cleared",
  Running = "Running",
  TimedOut = "TimedOut",
  Wiped = "Wiped",
}

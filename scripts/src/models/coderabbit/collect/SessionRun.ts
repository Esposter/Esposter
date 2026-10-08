// What a headless session did, as opposed to what its exit status says. A refusal to start and a run that failed
// Both exit non-zero, and only one of them is the caller's fault.
export interface SessionRun {
  // Whether the session exited zero, which says it ended and never that it finished — what proves the work is
  // The tree it left, read by the caller that knows what to expect of it
  isEnded: boolean;
  // Whether the session began at all: a `pnpm dlx` that never launched is nobody's attempt, and a caller that
  // Counted one would spend the attempt cap on an outage. A refusal by the account's limit is thrown instead
  // (`SessionLimitedError`)
  isStarted: boolean;
}

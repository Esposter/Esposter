// What a headless session did, as opposed to what its exit status says. A refusal to start and a run that failed
// Both exit non-zero, and only one of them is the caller's fault.
export interface SessionRun {
  // Whether the session exited zero, which says it ended and never that it finished — what proves the work is
  // The tree it left, read by the caller that knows what to expect of it
  isEnded: boolean;
  // Whether the session began at all: a `pnpm dlx` that never launched and a refusal by the session limit are
  // Both nobody's attempt, and a caller that counted one would spend a quarantine on an outage
  isStarted: boolean;
  // Set when Claude Code refused to start because the account is out of session, and when it lifts
  limitResetAtMs?: number;
}

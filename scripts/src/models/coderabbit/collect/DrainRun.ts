// What the drain session did, as opposed to what its exit status says. A refusal to start and a fix that failed
// Both exit non-zero, and only one of them is this review's fault.
export interface DrainRun {
  isDrained: boolean;
  // Whether the session began at all: a `pnpm dlx` that never launched and a refusal by the session limit are
  // Both nobody's attempt, and a caller that counted one would spend a quarantine on an outage
  isStarted: boolean;
  // Set when Claude Code refused to start because the account is out of session, and when it lifts
  limitResetAtMs?: number;
}

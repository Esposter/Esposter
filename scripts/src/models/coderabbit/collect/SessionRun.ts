// What a headless session did, as opposed to what its exit status says. A launch that wrote nothing and a refusal by
// The account's limit are thrown instead (`SessionUnstartedError`, `SessionLimitedError`), since neither is an attempt
// The caller made, so a run here is always one that started.
export interface SessionRun {
  // Whether the session exited zero, which says it ended and never that it finished — what proves the work is
  // The tree it left, read by the caller that knows what to expect of it. A session killed at its deadline reads false
  isEnded: boolean;
}

import { InvalidOperationError, Operation } from "@esposter/shared";

// Claude Code refused to start a session because the account hit a limit. No step that needs one can go on, so the
// Pass ends where it stood: the instant the limit lifts is marked on the newest release, and every run until then
// Idles before the merge and the port, since a release merged or a window ported then has no drain to follow it
// (docs: infra/review-collector/drain, "When it cannot").
export class SessionLimitedError extends InvalidOperationError {
  limitResetAtMs: number;

  constructor(limitResetAtMs: number) {
    super(Operation.Read, "coderabbit", `the session is limited until ${new Date(limitResetAtMs).toISOString()}`);
    this.name = "SessionLimitedError";
    this.limitResetAtMs = limitResetAtMs;
  }
}

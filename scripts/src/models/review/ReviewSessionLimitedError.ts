import { InvalidOperationError, Operation } from "@esposter/shared";

// Claude Code refused to start a session because the account hit its usage limit. No session can go on until the limit
// lifts, so the run stops where it stands: `main` does not move for an unfinished window, and no continuation is dispatched.
export class ReviewSessionLimitedError extends InvalidOperationError {
  constructor() {
    super(Operation.Read, "review", "the session is limited by Claude Code's usage limit");
    this.name = "ReviewSessionLimitedError";
  }
}

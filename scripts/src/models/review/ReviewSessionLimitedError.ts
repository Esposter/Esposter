import { InvalidOperationError, Operation } from "@esposter/shared";

// Claude Code refused to start a session because the account hit its usage limit. No session can go on until the limit
// Lifts, so the run stops where it stands: `main` does not move past a window that did not pass, and the next push resumes.
export class ReviewSessionLimitedError extends InvalidOperationError {
  constructor() {
    super(Operation.Read, "review", "the session is limited by Claude Code's usage limit");
    this.name = "ReviewSessionLimitedError";
  }
}

import { InvalidOperationError, Operation } from "@esposter/shared";

// A capped step's session failed and its attempt is already counted: the next run retries it, and past the cap
// The step is routed around. Nothing here is a person's yet, so the run ends idle rather than red — red is kept
// For what only a person can restart (docs: infra/review-collector, "Never blocked by what it carries").
export class AttemptFailedError extends InvalidOperationError {
  constructor(message: string) {
    super(Operation.Update, "coderabbit", message);
    this.name = "AttemptFailedError";
  }
}

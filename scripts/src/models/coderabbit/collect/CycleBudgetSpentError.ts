import { InvalidOperationError, Operation } from "@esposter/shared";

// The run has spent too much of its budget for the session a step was about to launch to end inside it. Nobody made an
// Attempt, so nothing is counted: the run ends idle, and the next one, on a fresh budget, launches the session a minute
// Later (docs: infra/review-collector/runner, "Failure semantics").
export class CycleBudgetSpentError extends InvalidOperationError {
  constructor(message: string) {
    super(Operation.Create, "coderabbit", message);
    this.name = "CycleBudgetSpentError";
  }
}

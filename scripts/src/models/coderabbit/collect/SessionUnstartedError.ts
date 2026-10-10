import { InvalidOperationError, Operation } from "@esposter/shared";

// The launch wrote nothing to its stream, so no session ran: `pnpm` refusing to launch one writes to stderr alone. It is
// Not an `AttemptFailedError`, since nobody made an attempt, and every step that launches a session ends the pass on
// It the same way, idle with the outage's retrigger (docs: infra/review-collector/runner, "Failure semantics").
export class SessionUnstartedError extends InvalidOperationError {
  constructor() {
    super(Operation.Read, "coderabbit", "no session started - the launch wrote nothing");
    this.name = "SessionUnstartedError";
  }
}

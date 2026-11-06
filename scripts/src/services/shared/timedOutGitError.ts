import { InvalidOperationError, Operation } from "@esposter/shared";

// The error a git command throws when its timeout killed it, naming the command so the failure says what hung
export const timedOutGitError = (args: string[], timeout: number | undefined): InvalidOperationError =>
  new InvalidOperationError(Operation.Update, `git ${args.join(" ")}`, `ran past ${timeout} ms and was killed`);

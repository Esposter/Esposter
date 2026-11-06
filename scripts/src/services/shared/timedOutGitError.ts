import { timedOutError } from "#src/services/shared/timedOutError";
import { Operation } from "@esposter/shared";

// The error a git command throws when its timeout killed it, naming the command so the failure says what hung
export const timedOutGitError = (args: string[], timeout: number | undefined) =>
  timedOutError(Operation.Update, `git ${args.join(" ")}`, timeout);

import { claudeOutputSchema } from "#src/models/review/ClaudeOutput";
import { getResult, jsonDateParse } from "@esposter/shared";

// Why a session exited non-zero. `claude` prints its refusal as the `result` of its JSON envelope on stdout and leaves stderr
// Empty, so stderr alone reads as a failure with no reason. A launch `pnpm` refused has no envelope, and its reason is stderr.
export const getSessionFailure = (stdout: string, stderr: string): string =>
  getResult(() => claudeOutputSchema.parse(jsonDateParse(stdout))).match(
    ({ result }) => result,
    () => stderr.trim(),
  );

import { ESC_ENVIRONMENT_NAME } from "#src/services/realtimeKit/constants";
import { InvalidOperationError, Operation, getResultAsync, noop } from "@esposter/shared";
import { execFileAsync } from "@esposter/shared-node/child-process";

// Writes a secret into ESC. The CLI takes the value as an argument, so it is in the process list for the length of the
// Call. A failure is named without the command line, which carries the value
export const setEscValue = async (key: string, value: string): Promise<void> =>
  (
    await getResultAsync(() =>
      execFileAsync("pulumi", ["env", "set", ESC_ENVIRONMENT_NAME, key, value, "--secret"], { encoding: "utf8" }),
    )
  ).match(noop, () => {
    throw new InvalidOperationError(Operation.Update, key, "could not be written to ESC");
  });

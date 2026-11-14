import type { CutoverEnvironmentVariables } from "#src/models/cutover/CutoverEnvironmentVariables";

import { cutoverEnvironmentVariablesSchema } from "#src/models/cutover/CutoverEnvironmentVariables";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Reads every credential from the environment, and refuses to run when one is missing or malformed.
// The error names the variables that failed, never their values
export const readCutoverEnvironment = (): CutoverEnvironmentVariables => {
  const result = cutoverEnvironmentVariablesSchema.safeParse(process.env);
  if (!result.success)
    throw new InvalidOperationError(
      Operation.Read,
      "environment",
      `these variables are missing or malformed: ${result.error.issues.map(({ path }) => path.join(".")).join(", ")}`,
    );
  return result.data;
};

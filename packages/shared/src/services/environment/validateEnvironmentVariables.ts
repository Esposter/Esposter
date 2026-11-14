import type { z } from "zod";

import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";

// Names every variable that fails, so one boot reports the whole fix rather than the first gap.
// A zod issue never quotes the value it rejected, so a secret that is malformed does not reach the log.
// The parsed environment is returned, so a Worker that validates once at its start keeps what it checked.
// That keeps it from reading the environment again
export const validateEnvironmentVariables = <Output>(
  schema: z.ZodType<Output>,
  environment: Record<string, string | undefined>,
): Output => {
  const { data, error, success } = schema.safeParse(environment);
  if (success) return data;
  throw new InvalidOperationError(
    Operation.Read,
    "environment variables",
    error.issues.map(({ message, path }) => `${path.join(".")}: ${message}`).join("; "),
  );
};

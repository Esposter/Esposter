import type { z } from "zod";

import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";

// Names every variable that fails, so one boot reports the whole fix rather than the first gap. A zod issue never
// Quotes the value it rejected, so a secret that is malformed does not reach the log
export const validateEnvironmentVariables = (
  schema: z.ZodType,
  environment: Record<string, string | undefined>,
): void => {
  const { error, success } = schema.safeParse(environment);
  if (success) return;
  throw new InvalidOperationError(
    Operation.Read,
    "environment variables",
    error.issues.map(({ message, path }) => `${path.join(".")}: ${message}`).join("; "),
  );
};

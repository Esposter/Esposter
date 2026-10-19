import type { Operation } from "@esposter/shared";

import { InvalidOperationError } from "@esposter/shared";

// Throws one error when any failure was collected, its message the given text and then every failure on its own
// Line, so the error names each one
export const throwCollectedFailures = (
  operation: Operation,
  subject: string,
  message: string,
  failures: readonly string[],
): void => {
  if (failures.length > 0) throw new InvalidOperationError(operation, subject, `${message}:\n${failures.join("\n")}`);
};

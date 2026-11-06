import type { Operation } from "@esposter/shared";

import { InvalidOperationError } from "@esposter/shared";

// The error a command throws when its timeout killed it, naming the bound it ran past so a failure says what hung.
// `subject` is what ran past the bound, left empty where the name already says it
export const timedOutError = (
  operation: Operation,
  name: string,
  timeout: number | undefined,
  subject = "",
): InvalidOperationError => {
  const ranPast = `ran past ${timeout} ms and was killed`;
  return new InvalidOperationError(operation, name, subject === "" ? ranPast : `${subject} ${ranPast}`);
};

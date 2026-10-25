import { InvalidOperationError, Operation } from "@esposter/shared";

export const invalidRead = (message: string): InvalidOperationError =>
  new InvalidOperationError(Operation.Read, "deck", message);

import { InvalidOperationError, Operation } from "@esposter/shared";

export const invalidRead = (message: string) => new InvalidOperationError(Operation.Read, "deck", message);

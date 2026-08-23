import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";

export const exhaustiveGuard = (value: never): never => {
  throw new InvalidOperationError(Operation.Read, exhaustiveGuard.name, JSON.stringify(value));
};

import { InvalidOperationError } from "@esposter/shared/models/error/InvalidOperationError";
import { Operation } from "@esposter/shared/models/shared/Operation";

export const exhaustiveGuard = (value: never) => {
  throw new InvalidOperationError(Operation.Read, exhaustiveGuard.name, JSON.stringify(value));
};

import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";

export const exhaustiveGuard = (value: never) => {
  throw new InvalidOperationError(Operation.Read, exhaustiveGuard.name, JSON.stringify(value));
};

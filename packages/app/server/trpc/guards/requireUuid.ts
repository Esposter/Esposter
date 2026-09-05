import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { checkIsUuidV4, Operation } from "@esposter/shared";

// The read is what a malformed id invalidates, which is why every room procedure builder rejects with the same
// Operation rather than naming its own.
// The context is built here from the value rather than taken from the caller, because the obvious caller-side
// Spelling is `JSON.stringify(input)` — which throws outright on a room input carrying a `bigint` permission
// Bitfield, turning a rejected id into an unhandled serializer error.
export const requireUuid = (value: unknown, name: string): string => {
  if (typeof value !== "string" || !checkIsUuidV4(value))
    throw getInvalidOperationError(Operation.Read, name, String(value));
  return value;
};

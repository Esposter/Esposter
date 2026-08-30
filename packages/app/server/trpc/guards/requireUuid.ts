import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { checkIsUuidV4, Operation } from "@esposter/shared";

// The check every room procedure builder runs before its membership, ownership or permission read: the id it is
// About to look up must be one the table could hold. The read is what the malformed id invalidates, so all three
// Builders reject identically rather than each naming its own operation.
// The context is built here from the value rather than taken from the caller, because the obvious caller-side
// Spelling is `JSON.stringify(input)` — which throws outright on a room input carrying a `bigint` permission
// Bitfield, turning a rejected id into an unhandled serializer error.
export const requireUuid = (value: unknown, name: string): string => {
  if (typeof value !== "string" || !checkIsUuidV4(value))
    throw getInvalidOperationError(Operation.Read, name, String(value));
  return value;
};

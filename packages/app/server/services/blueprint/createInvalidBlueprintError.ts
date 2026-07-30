import { DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// A malformed manifest is user input — a hand-edited cycle, an unknown alias, content its own type rejects —
// So every manifest rejection is a BAD_REQUEST carrying the InvalidOperationError text. Thrown bare it would
// Surface as an INTERNAL_SERVER_ERROR, indistinguishable in the UI and the logs from a genuine server fault
export const createInvalidBlueprintError = (message: string): TRPCError =>
  new TRPCError({
    code: "BAD_REQUEST",
    message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Resource, message).message,
  });

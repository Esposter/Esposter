import type { TRPCError } from "@trpc/server";

import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { DatabaseEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// A malformed manifest is user input — a hand-edited cycle, an unknown alias, content its own type rejects —
// So every manifest rejection is a BAD_REQUEST carrying the InvalidOperationError text. Thrown bare it would
// Surface as an INTERNAL_SERVER_ERROR, indistinguishable in the UI and the logs from a genuine server fault
export const createInvalidBlueprintError = (message: string): TRPCError =>
  getInvalidOperationError(Operation.Create, DatabaseEntityType.Resource, message);

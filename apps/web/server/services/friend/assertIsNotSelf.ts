import type { DatabaseEntityType } from "@esposter/db-schema";
import type { Operation } from "@esposter/shared";

import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";

export const assertIsNotSelf = (
  operation: Operation,
  entityType: DatabaseEntityType,
  userId: string,
  targetUserId: string,
) => {
  if (userId === targetUserId) throw getInvalidOperationError(operation, entityType, userId);
};

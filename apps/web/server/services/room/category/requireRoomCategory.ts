import type { RequireMutationCode } from "#server/models/trpc/RequireMutationCode";
import type { RoomCategoryInMessage } from "@esposter/db-schema";
import type { Operation } from "@esposter/shared";

import { requireMutation } from "#server/trpc/guards/requireMutation";
import { DatabaseEntityType } from "@esposter/db-schema";

// Every category mutation addresses one of the caller's own categories, so a miss is refused by the same guard, and
// The code it carries is the caller's choice
export const requireRoomCategory = (
  roomCategory: RoomCategoryInMessage | undefined,
  operation: Operation,
  context: string,
  code?: RequireMutationCode,
) => requireMutation(roomCategory, operation, DatabaseEntityType.RoomCategory, context, code);

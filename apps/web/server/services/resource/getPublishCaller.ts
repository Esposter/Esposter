import type { PublishCaller } from "#server/models/resource/PublishCaller";
import type { Context } from "#server/trpc/context";
import type { ResourceType } from "@esposter/db-schema";

import { publishCallers } from "#server/services/resource/resourceCallers";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { Operation } from "@esposter/shared";

// The one publish refusal: a type that does not publish is refused in words, and one that does is given its own router's
// Caller, so the type's publish transform runs
export const getPublishCaller = (type: ResourceType, ctx: Context): PublishCaller => {
  if (!checkHasCapability(type, "publishable"))
    throw getInvalidOperationError(Operation.Update, type, "does not publish");
  return publishCallers[type](ctx);
};

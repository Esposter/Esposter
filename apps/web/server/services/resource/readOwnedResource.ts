import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

import { findOwnedResource } from "#server/services/resource/findOwnedResource";

// The owned lookup for a caller with a session: the session's user is the owner the shared lookup is asked about
export const readOwnedResource = (
  ctx: AuthedContext,
  id: ResourceInResource["id"],
  type: ResourceType | undefined,
  isDeletedOnly = false,
): Promise<ResourceInResource | undefined> =>
  findOwnedResource(ctx.db, ctx.getSessionPayload.user.id, id, type, isDeletedOnly);

import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { ResourceWhere } from "#server/models/resource/ResourceWhere";
import type { LinkedResource } from "#shared/models/resource/LinkedResource";

import { MAX_READ_LIMIT } from "@esposter/shared";

// The caller's live resources matching a where, as the name and type a reference shows, by name. The ownership and the
// Soft-delete guard are the caller's own on every such read, so a where names only what it selects
export const readLiveOwnedResourceSummaries = (ctx: AuthedContext, where: ResourceWhere): Promise<LinkedResource[]> =>
  ctx.db.query.resourcesInResource.findMany({
    columns: { id: true, name: true, type: true },
    limit: MAX_READ_LIMIT,
    orderBy: { name: "asc" },
    where: { ...where, deletedAt: { isNull: true }, userId: { eq: ctx.getSessionPayload.user.id } },
  });

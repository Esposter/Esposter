import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource, ResourceType } from "@esposter/db-schema";

import { TRPCError } from "@trpc/server";

// The single owner+type resource lookup shared by getOwnerProcedure and dataset reads. Pass
// Undefined as the type for cross-type lookups (e.g. the explorer's readResource). IsDeletedOnly
// Inverts the soft-delete guard: a resource in the Recycle bin is gone as far as every binding is
// Concerned (its page 404s and its consumers read it as a dangling binding), while restore/purge
// May only ever resolve a binned one.
export const requireOwnedResource = async (
  ctx: AuthedContext,
  id: Resource["id"],
  type: ResourceType | undefined,
  isDeletedOnly = false,
): Promise<Resource> => {
  const resource = await ctx.db.query.resources.findFirst({
    where: {
      deletedAt: isDeletedOnly ? { isNotNull: true } : { isNull: true },
      id: { eq: id },
      ...(type === undefined ? {} : { type: { eq: type } }),
      userId: { eq: ctx.getSessionPayload.user.id },
    },
  });
  if (!resource) throw new TRPCError({ code: "UNAUTHORIZED" });
  return resource;
};

import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { Resource, ResourceType } from "@esposter/db-schema";

import { TRPCError } from "@trpc/server";

// A resource in the Recycle bin is gone as far as every binding is concerned — it must not keep
// Feeding live datasets, and its consumers read that as a dangling binding
export const requireActiveOwnedResource = async (
  ctx: AuthedContext,
  id: Resource["id"],
  type: ResourceType,
): Promise<Resource> => {
  const resource = await ctx.db.query.resources.findFirst({
    where: {
      deletedAt: { isNull: true },
      id: { eq: id },
      type: { eq: type },
      userId: { eq: ctx.getSessionPayload.user.id },
    },
  });
  if (!resource) throw new TRPCError({ code: "UNAUTHORIZED" });
  return resource;
};

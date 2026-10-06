import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { ResourceInResource, ResourceType } from "@esposter/db-schema";

import { readOwnedResource } from "#server/services/resource/readOwnedResource";
import { TRPCError } from "@trpc/server";

// The owned lookup as an access check, for a procedure acting on the resource it names: one the caller does not own
// Is refused, never reported missing
export const requireOwnedResource = async (
  ctx: AuthedContext,
  id: ResourceInResource["id"],
  type: ResourceType | undefined,
  isDeletedOnly = false,
): Promise<ResourceInResource> => {
  const resource = await readOwnedResource(ctx, id, type, isDeletedOnly);
  if (!resource) throw new TRPCError({ code: "UNAUTHORIZED" });
  return resource;
};

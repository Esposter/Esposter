import { resourceAccessesInResource, resourcesInResource } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// Caller-scoped: the row is the relationship, not a property of the resource, so one user's Recent can never
// Reflect another's
export const getLastAccessedJoin = (userId: string) =>
  and(eq(resourceAccessesInResource.resourceId, resourcesInResource.id), eq(resourceAccessesInResource.userId, userId));

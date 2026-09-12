import { resourceAccesses, resources } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// Caller-scoped: the row is the relationship, not a property of the resource, so one user's Recent can never
// Reflect another's
export const getLastAccessedJoin = (userId: string) =>
  and(eq(resourceAccesses.resourceId, resources.id), eq(resourceAccesses.userId, userId));

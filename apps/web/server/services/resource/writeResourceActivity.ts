import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { WriteResourceActivityInput } from "#server/models/resource/WriteResourceActivityInput";

import { CONTENT_SAVED_COALESCE_WINDOW_MS } from "#server/services/resource/constants";
import { writeResourceActivities } from "#server/services/resource/writeResourceActivities";
import { resourceActivitiesInResource, ResourceActivityType, resourcesInResource } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq, gt, isNull, notExists, sql } from "drizzle-orm";
import { v7 } from "uuid";

// Emitted after the primary write, where a failure costs one trail entry and never the user's mutation. The writer is
// The context's user, and the key an agent came through or null for the owner's own hand
export const writeResourceActivity = (ctx: AuthedContext, { resourceId, ...rest }: WriteResourceActivityInput) => {
  if (rest.activityType !== ResourceActivityType.ContentSaved)
    return writeResourceActivities(ctx, { ...rest, resourceIds: [resourceId] });
  return getResultAsync(async () => {
    const userId = ctx.user.id;
    const apiKeyId = ctx.apiKey?.id ?? null;
    const apiKeyName = ctx.apiKey?.name ?? "";
    // A save inside the window of the same user's save of this resource, by the same key, writes no entry. The check and
    // The insert are one statement selecting from the resource, so an entry is written only when the resource is there and
    // No save of its own is recent. Two saves racing inside the window can both find nothing and both write, which costs
    // The trail one extra line. Per key as well as per user, so an agent's run of saves and the owner's typing stay apart
    const recentEntries = ctx.db
      .select({ id: resourceActivitiesInResource.id })
      .from(resourceActivitiesInResource)
      .where(
        and(
          eq(resourceActivitiesInResource.resourceId, resourceId),
          eq(resourceActivitiesInResource.activityType, ResourceActivityType.ContentSaved),
          eq(resourceActivitiesInResource.userId, userId),
          apiKeyId === null
            ? isNull(resourceActivitiesInResource.apiKeyId)
            : eq(resourceActivitiesInResource.apiKeyId, apiKeyId),
          gt(resourceActivitiesInResource.createdAt, new Date(Date.now() - CONTENT_SAVED_COALESCE_WINDOW_MS)),
        ),
      );
    // Epoch milliseconds and a generated id, since an insert from a select takes no JS default for any of them
    const now = Date.now();
    await ctx.db.insert(resourceActivitiesInResource).select(
      ctx.db
        .select({
          activityType: sql<ResourceActivityType>`${rest.activityType}`.as("activityType"),
          apiKeyId: sql<null | string>`${apiKeyId}`.as("apiKeyId"),
          apiKeyName: sql<string>`${apiKeyName}`.as("apiKeyName"),
          createdAt: sql<Date>`${now}`.as("createdAt"),
          id: sql<string>`${v7()}`.as("id"),
          resourceId: resourcesInResource.id,
          updatedAt: sql<Date>`${now}`.as("updatedAt"),
          userId: sql<string>`${userId}`.as("userId"),
        })
        .from(resourcesInResource)
        .where(and(eq(resourcesInResource.id, resourceId), notExists(recentEntries))),
    );
  }).match(noop, console.error);
};

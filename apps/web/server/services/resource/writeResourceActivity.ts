import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { WriteResourceActivityInput } from "#server/models/resource/WriteResourceActivityInput";

import { CONTENT_SAVED_COALESCE_WINDOW_MS } from "#server/services/resource/constants";
import { ResourceActivityType, resourceActivitiesInResource } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq, gt, isNull } from "drizzle-orm";

// Emitted after the primary write, where a failure costs one trail entry and never the user's mutation. The writer is
// The context's user, and the key an agent came through or null for the owner's own hand
export const writeResourceActivity = (ctx: AuthedContext, { resourceId, ...rest }: WriteResourceActivityInput) =>
  getResultAsync(async () => {
    const userId = ctx.getSessionPayload.user.id;
    const apiKeyId = ctx.apiKey?.id ?? null;
    if (rest.activityType === ResourceActivityType.ContentSaved) {
      // Coalesce on existence rather than on a read of the latest entry, so two saves racing inside the window both
      // find nothing and both write, which costs the trail one extra line. Per key as well as per user, so an agent's
      // run of saves and a stretch of the owner's typing stay apart
      const recentEntries = await ctx.db
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
        )
        .limit(1);
      if (recentEntries.length > 0) return;
    }

    await ctx.db
      .insert(resourceActivitiesInResource)
      .values({ ...rest, apiKeyId, apiKeyName: ctx.apiKey?.name ?? "", resourceId, userId });
  }).match(noop, console.error);

import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { WriteResourceActivityInput } from "#server/models/resource/WriteResourceActivityInput";
import type { ResourceActivityType } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { resourceActivitiesInResource } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { v7 } from "uuid";

// One trail entry of one activity per resource, in a single statement that reads the resources from a JSON array, so a
// Bulk restore of any size binds one parameter. Every entry carries the same payload, such as a rename's names. Emitted
// After the primary write, where a failure costs the trail its entries and never the mutation
export const writeResourceActivities = (
  ctx: AuthedContext,
  {
    activityType,
    newName,
    oldName,
    publishVersion,
    resourceIds,
  }: Except<WriteResourceActivityInput, "resourceId"> & { resourceIds: string[] },
) =>
  getResultAsync(async () => {
    if (resourceIds.length === 0) return;

    const entries = JSON.stringify(resourceIds.map((resourceId) => ({ id: v7(), resourceId })));
    // Epoch milliseconds, since an insert from a select takes no JS default for the timestamps
    const now = Date.now();
    await ctx.db
      .insert(resourceActivitiesInResource)
      .select(
        ctx.db
          .select({
            activityType: sql<ResourceActivityType>`${activityType}`.as("activityType"),
            apiKeyId: sql<null | string>`${ctx.apiKey?.id ?? null}`.as("apiKeyId"),
            apiKeyName: sql<string>`${ctx.apiKey?.name ?? ""}`.as("apiKeyName"),
            createdAt: sql<Date>`${now}`.as("createdAt"),
            id: sql<string>`json_extract(entry.value, '$.id')`.as("id"),
            newName: sql<null | string>`${newName ?? null}`.as("newName"),
            oldName: sql<null | string>`${oldName ?? null}`.as("oldName"),
            publishVersion: sql<null | number>`${publishVersion ?? null}`.as("publishVersion"),
            resourceId: sql<string>`json_extract(entry.value, '$.resourceId')`.as("resourceId"),
            updatedAt: sql<Date>`${now}`.as("updatedAt"),
            userId: sql<string>`${ctx.user.id}`.as("userId"),
          })
          .from(sql`json_each(${entries}) AS entry`),
      );
  }).match(noop, console.error);

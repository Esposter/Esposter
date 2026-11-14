import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { resourceViewsInResource } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq, sql } from "drizzle-orm";

// The views across every day the resource has been counted on
export const readResourceViewCount = async (db: Context["db"], resourceId: ResourceInResource["id"]): Promise<number> =>
  takeOne(
    await db
      .select({ total: sql<number>`coalesce(sum(${resourceViewsInResource.count}), 0)` })
      .from(resourceViewsInResource)
      .where(eq(resourceViewsInResource.resourceId, resourceId)),
  ).total;

import { resourceSchema } from "#src/schema/resource/resourceSchema";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { createMinimumCheckSql } from "#src/services/shared/createMinimumCheckSql";
import { sqliteTable } from "#src/sqliteTable";
import { check, integer, text, unique } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";

// The public view counter: one row per resource per UTC day, incremented in place so every view counts exactly once
export const resourceViewsInResource = sqliteTable(
  "resourceViews",
  {
    count: integer().notNull().default(0),
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    resourceId: text()
      .notNull()
      .references(() => resourcesInResource.id, { onDelete: "cascade" }),
    // The UTC day the views were counted on, as YYYY-MM-DD
    utcDate: text().notNull(),
  },
  {
    extraConfig: ({ count, resourceId, utcDate }) => [
      check("resourceViews_count_check", createMinimumCheckSql(count, 0)),
      // The row a day's views increment, and the index a resource's total sums over
      unique("resourceViews_resourceId_utcDate_unique").on(resourceId, utcDate),
    ],
    schema: resourceSchema,
  },
);

export type ResourceViewInResource = typeof resourceViewsInResource.$inferSelect;

export const selectResourceViewInResourceSchema = createSelectSchema(resourceViewsInResource);

import { DataExportStatus } from "#src/models/user/DataExportStatus";
import { pgTable } from "#src/pgTable";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { userSchema } from "#src/schema/user/userSchema";
import { sql } from "drizzle-orm";
import { index, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const dataExportStatusEnum = userSchema.enum("dataExportStatus", DataExportStatus);

// One row per request for a person's data archive. The archive is one blob named after the row's id, so a replayed
// Build rewrites its own blob rather than adding one. A queued row has no archive yet, which is why its blob name is
// Null until the build starts. The row's status is the only pointer a read follows
export const dataExportsInUser = pgTable(
  "dataExports",
  {
    blobName: text(),
    // Seven days after readyAt. The container's lifecycle rule deletes the blob on the same period, but a link is
    // Refused once this has passed even while the blob still exists
    expiresAt: timestamp(),
    failureReason: text(),
    id: uuid().primaryKey().defaultRandom(),
    readyAt: timestamp(),
    // When the person asked for the export. The settings page orders by it, so the latest export is the one it shows
    // Whatever its status, a failed one included
    requestedAt: timestamp().notNull().defaultNow(),
    status: dataExportStatusEnum().notNull(),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ status, userId }) => [
      // Bounds the work an account can start: a second request while one export is queued or building finds the first
      // One rather than inserting another row
      uniqueIndex("dataExports_userId_status_unique")
        .on(userId)
        .where(sql`${status} IN ('queued', 'building')`),
      // The cascade from a user's deletion reads every export of that user, whatever its status, which the partial
      // Index above cannot serve
      index("dataExports_userId_index").on(userId),
    ],
    schema: userSchema,
  },
);

export type DataExportInUser = typeof dataExportsInUser.$inferSelect;

export const selectDataExportInUserSchema = createSelectSchema(dataExportsInUser);

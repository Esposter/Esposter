import type { LegacyScheduledJob } from "#src/models/cutover/LegacyScheduledJob";
import type { SourceClient } from "#src/models/cutover/SourceClient";

import { legacyScheduledJobSchema } from "#src/models/cutover/LegacyScheduledJob";

// The jobs the old estate had not yet run: neither completed nor cancelled. They have no D1 table: a scheduled message is
// Imported into its room's object and a reminder is armed on its owner's, so each step that moves one reads them here
export const readPendingScheduledJobs = async (source: SourceClient): Promise<LegacyScheduledJob[]> => {
  const rows = await source`
    SELECT "id", "payload", "roomId", "runAt", "userId"
    FROM "message"."scheduledMessageJobs"
    WHERE "completedAt" IS NULL AND "cancelledAt" IS NULL
    ORDER BY "id"
  `;
  return rows.map((row) => legacyScheduledJobSchema.parse(row));
};

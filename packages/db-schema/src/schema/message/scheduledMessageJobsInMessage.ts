import type { ScheduledMessageJobPayload } from "#src/models/message/scheduledMessageJob/ScheduledMessageJobPayload";

import { scheduledMessageJobPayloadSchema } from "#src/models/message/scheduledMessageJob/ScheduledMessageJobPayload";
import { ScheduledMessageJobType } from "#src/models/message/ScheduledMessageJobType";
import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { messageSchema } from "#src/schema/message/messageSchema";
import { roomsInMessage } from "#src/schema/message/roomsInMessage";
import { sqliteTable } from "#src/sqliteTable";
import { sql } from "drizzle-orm";
import { check, index, integer, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-orm/zod";
import { z } from "zod";

export const scheduledMessageJobsInMessage = sqliteTable(
  "scheduledMessageJobs",
  {
    cancelledAt: integer({ mode: "timestamp_ms" }),
    completedAt: integer({ mode: "timestamp_ms" }),
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    payload: text({ mode: "json" }).notNull().$type<ScheduledMessageJobPayload>(),
    processingStartedAt: integer({ mode: "timestamp_ms" }),
    roomId: text()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    runAt: integer({ mode: "timestamp_ms" }).notNull(),
    userId: text()
      .notNull()
      .references(() => usersInAuth.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ payload, roomId, runAt, userId }) => [
      check(
        "scheduledMessageJobs_payload_type_check",
        sql`
          (json_extract(${payload}, '$.type') = '${sql.raw(ScheduledMessageJobType.Reminder)}' AND json_type(${payload}, '$.text') IS NOT NULL)
          OR (json_extract(${payload}, '$.type') = '${sql.raw(ScheduledMessageJobType.ScheduledMessage)}' AND json_type(${payload}, '$.message') IS NOT NULL)
        `,
      ),
      index("scheduledMessageJobs_userId_roomId_runAt_index").on(userId, roomId, runAt),
    ],
    schema: messageSchema,
  },
);

export type ScheduledMessageJobInMessage = typeof scheduledMessageJobsInMessage.$inferSelect;

export const selectScheduledMessageJobInMessageSchema = createSelectSchema(scheduledMessageJobsInMessage, {
  id: () => z.uuidv4(),
  payload: scheduledMessageJobPayloadSchema,
  roomId: () => z.uuidv4(),
});

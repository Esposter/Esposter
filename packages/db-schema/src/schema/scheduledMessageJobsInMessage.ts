import type { ScheduledMessageJobPayload } from "@/models/message/scheduledMessageJob/ScheduledMessageJobPayload";

import { scheduledMessageJobPayloadSchema } from "@/models/message/scheduledMessageJob/ScheduledMessageJobPayload";
import { ScheduledMessageJobType } from "@/models/message/ScheduledMessageJobType";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, index, jsonb, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const scheduledMessageJobsInMessage = pgTable(
  "scheduledMessageJobs",
  {
    cancelledAt: timestamp(),
    completedAt: timestamp(),
    id: uuid().primaryKey().defaultRandom(),
    payload: jsonb().notNull().$type<ScheduledMessageJobPayload>(),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    runAt: timestamp().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ payload, roomId, runAt, userId }) => [
      check(
        "scheduled_message_jobs_payload_type_check",
        sql`
          (${payload}->>'type' = '${sql.raw(ScheduledMessageJobType.Reminder)}' AND ${payload} ? 'text')
          OR (${payload}->>'type' = '${sql.raw(ScheduledMessageJobType.ScheduledMessage)}' AND ${payload} ? 'message')
        `,
      ),
      index("scheduled_message_jobs_userId_roomId_runAt_index").on(userId, roomId, runAt),
    ],
    schema: messageSchema,
  },
);

export type ScheduledMessageJobInMessage = typeof scheduledMessageJobsInMessage.$inferSelect;

export const selectScheduledMessageJobInMessageSchema = createSelectSchema(scheduledMessageJobsInMessage, {
  payload: scheduledMessageJobPayloadSchema,
});

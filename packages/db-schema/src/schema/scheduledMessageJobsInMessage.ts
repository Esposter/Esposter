import {
  type ScheduledMessageJobPayload,
  scheduledMessageJobPayloadSchema,
} from "@/models/message/scheduledMessageJob/ScheduledMessageJobPayload";
import { ScheduledMessageJobType, scheduledMessageJobTypeSchema } from "@/models/message/ScheduledMessageJobType";
import { pgTable } from "@/pgTable";
import { messageSchema } from "@/schema/messageSchema";
import { roomsInMessage } from "@/schema/roomsInMessage";
import { users } from "@/schema/users";
import { sql } from "drizzle-orm";
import { check, index, jsonb, pgEnum, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const scheduledMessageJobTypeEnum = pgEnum("scheduled_message_job_type", ScheduledMessageJobType);

export const scheduledMessageJobsInMessage = pgTable(
  "scheduledMessageJobs",
  {
    cancelledAt: timestamp(),
    completedAt: timestamp(),
    id: uuid().primaryKey().defaultRandom(),
    payload: jsonb().notNull().$type<ScheduledMessageJobPayload>(),
    processingStartedAt: timestamp(),
    roomId: uuid()
      .notNull()
      .references(() => roomsInMessage.id, { onDelete: "cascade" }),
    runAt: timestamp().notNull(),
    type: scheduledMessageJobTypeEnum().notNull(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  {
    extraConfig: ({ payload, roomId, runAt, type, userId }) => [
      check(
        "scheduled_message_jobs_payload_type_check",
        sql`
          (${type} = '${sql.raw(ScheduledMessageJobType.Reminder)}' AND ${payload} ? 'text')
          OR (${type} = '${sql.raw(ScheduledMessageJobType.ScheduledMessage)}' AND ${payload} ? 'message')
        `,
      ),
      index("scheduled_message_jobs_roomId_runAt_index").on(roomId, runAt),
      index("scheduled_message_jobs_userId_runAt_index").on(userId, runAt),
    ],
    schema: messageSchema,
  },
);

export type ScheduledMessageJobInMessage = typeof scheduledMessageJobsInMessage.$inferSelect;

export const selectScheduledMessageJobInMessageSchema = createSelectSchema(scheduledMessageJobsInMessage, {
  payload: scheduledMessageJobPayloadSchema,
  type: scheduledMessageJobTypeSchema,
});

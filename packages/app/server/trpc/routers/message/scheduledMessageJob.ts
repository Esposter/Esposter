import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { MessageEntity, ScheduledMessageJobInMessage } from "@esposter/db-schema";

import { cancelScheduledMessageJobInputSchema } from "#shared/models/db/message/scheduledMessageJob/CancelScheduledMessageJobInput";
import { readMyScheduledMessageJobsInputSchema } from "#shared/models/db/message/scheduledMessageJob/ReadMyScheduledMessageJobsInput";
import { readScheduledMessageJobsInputSchema } from "#shared/models/db/message/scheduledMessageJob/ReadScheduledMessageJobsInput";
import { rescheduleMessageInputSchema } from "#shared/models/db/message/scheduledMessageJob/RescheduleMessageInput";
import { scheduleMessageInputSchema } from "#shared/models/db/message/scheduledMessageJob/ScheduleMessageInput";
import { scheduleReminderInputSchema } from "#shared/models/db/message/scheduledMessageJob/ScheduleReminderInput";
import { useQueueClient } from "@@/server/composables/azure/queue/useQueueClient";
import { createUserMessage } from "@@/server/services/message/createUserMessage";
import { assertCanCreateMessage } from "@@/server/services/message/moderation/assertCanCreateMessage";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { enqueueScheduledMessageJob } from "@esposter/db";
import {
  AzureQueue,
  DatabaseEntityType,
  MessageType,
  roomsInMessage,
  scheduledMessageScheduledMessageJobPayloadSchema,
  scheduledMessageJobsInMessage,
  ScheduledMessageJobType,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, asc, count, eq, isNull, sql } from "drizzle-orm";

export const scheduledMessageJobRouter = router({
  cancelScheduledJob: standardAuthedProcedure
    .input(cancelScheduledMessageJobInputSchema)
    .mutation<ScheduledMessageJobInMessage>(async ({ ctx, input }) =>
      requireMutation(
        (
          await ctx.db
            .update(scheduledMessageJobsInMessage)
            .set({ cancelledAt: new Date() })
            .where(
              and(
                eq(scheduledMessageJobsInMessage.id, input.id),
                eq(scheduledMessageJobsInMessage.userId, ctx.getSessionPayload.user.id),
                isNull(scheduledMessageJobsInMessage.cancelledAt),
                isNull(scheduledMessageJobsInMessage.completedAt),
              ),
            )
            .returning()
        )[0],
        Operation.Update,
        DatabaseEntityType.ScheduledMessageJob,
        input.id,
        "NOT_FOUND",
      ),
    ),
  readMyScheduledJobs: standardAuthedProcedure
    .input(readMyScheduledMessageJobsInputSchema)
    .query<OffsetPaginationData<ScheduledMessageJobInMessageWithRoom>>(async ({ ctx, input: { limit, offset } }) => {
      const rows = await ctx.db
        .select({
          room: roomsInMessage,
          scheduledMessageJob: scheduledMessageJobsInMessage,
        })
        .from(scheduledMessageJobsInMessage)
        .innerJoin(roomsInMessage, eq(scheduledMessageJobsInMessage.roomId, roomsInMessage.id))
        .where(
          and(
            eq(scheduledMessageJobsInMessage.userId, ctx.getSessionPayload.user.id),
            isNull(scheduledMessageJobsInMessage.cancelledAt),
            isNull(scheduledMessageJobsInMessage.completedAt),
          ),
        )
        .orderBy(asc(scheduledMessageJobsInMessage.runAt))
        .limit(limit + 1)
        .offset(offset);
      const items = rows
        .slice(0, limit)
        .map(({ room, scheduledMessageJob }) => Object.assign(scheduledMessageJob, { room }));
      return {
        hasMore: rows.length > limit,
        items,
      };
    }),
  readMyScheduledJobsCount: standardAuthedProcedure.query<number>(
    async ({ ctx }) =>
      (
        await ctx.db
          .select({ count: count() })
          .from(scheduledMessageJobsInMessage)
          .where(
            and(
              eq(scheduledMessageJobsInMessage.userId, ctx.getSessionPayload.user.id),
              isNull(scheduledMessageJobsInMessage.cancelledAt),
              isNull(scheduledMessageJobsInMessage.completedAt),
            ),
          )
      )[0]?.count ?? 0,
  ),
  readScheduledJobs: getMemberProcedure(readScheduledMessageJobsInputSchema, "roomId").query<
    ScheduledMessageJobInMessage[]
  >(({ ctx, input }) =>
    ctx.db
      .select()
      .from(scheduledMessageJobsInMessage)
      .where(
        and(
          eq(scheduledMessageJobsInMessage.userId, ctx.getSessionPayload.user.id),
          eq(scheduledMessageJobsInMessage.roomId, input.roomId),
          isNull(scheduledMessageJobsInMessage.cancelledAt),
          isNull(scheduledMessageJobsInMessage.completedAt),
        ),
      )
      .orderBy(asc(scheduledMessageJobsInMessage.runAt)),
  ),
  rescheduleMessage: getMemberProcedure(rescheduleMessageInputSchema, "roomId").mutation<ScheduledMessageJobInMessage>(
    async ({ ctx, input }) => {
      await assertCanCreateMessage(ctx.db, ctx.getSessionPayload.user.id, input.roomId, input.message);
      const job = await ctx.db.transaction(async (tx) => {
        requireMutation(
          (
            await tx
              .update(scheduledMessageJobsInMessage)
              .set({ cancelledAt: new Date() })
              .where(
                and(
                  eq(scheduledMessageJobsInMessage.id, input.id),
                  eq(scheduledMessageJobsInMessage.userId, ctx.getSessionPayload.user.id),
                  isNull(scheduledMessageJobsInMessage.cancelledAt),
                  isNull(scheduledMessageJobsInMessage.completedAt),
                  sql`${scheduledMessageJobsInMessage.payload}->>'type' = ${ScheduledMessageJobType.ScheduledMessage}`,
                ),
              )
              .returning()
          )[0],
          Operation.Update,
          DatabaseEntityType.ScheduledMessageJob,
          input.id,
          "NOT_FOUND",
        );
        return requireMutation(
          (
            await tx
              .insert(scheduledMessageJobsInMessage)
              .values({
                payload: { message: input.message, type: ScheduledMessageJobType.ScheduledMessage },
                roomId: input.roomId,
                runAt: input.runAt,
                userId: ctx.getSessionPayload.user.id,
              })
              .returning()
          )[0],
          Operation.Create,
          DatabaseEntityType.ScheduledMessageJob,
          JSON.stringify(input),
        );
      });
      await enqueueScheduledMessageJob(useQueueClient(AzureQueue.ScheduledMessageJobs), job.id, job.runAt);
      return job;
    },
  ),
  scheduleMessage: getMemberProcedure(scheduleMessageInputSchema, "roomId").mutation<ScheduledMessageJobInMessage>(
    async ({ ctx, input }) => {
      await assertCanCreateMessage(ctx.db, ctx.getSessionPayload.user.id, input.roomId, input.message);
      const job = requireMutation(
        (
          await ctx.db
            .insert(scheduledMessageJobsInMessage)
            .values({
              payload: { message: input.message, type: ScheduledMessageJobType.ScheduledMessage },
              roomId: input.roomId,
              runAt: input.runAt,
              userId: ctx.getSessionPayload.user.id,
            })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.ScheduledMessageJob,
        JSON.stringify(input),
      );
      await enqueueScheduledMessageJob(useQueueClient(AzureQueue.ScheduledMessageJobs), job.id, job.runAt);
      return job;
    },
  ),
  sendScheduledMessageNow: standardAuthedProcedure
    .input(cancelScheduledMessageJobInputSchema)
    .mutation<MessageEntity>(async ({ ctx, input }) => {
      const scheduledMessageJob = requireMutation(
        (
          await ctx.db
            .update(scheduledMessageJobsInMessage)
            .set({ cancelledAt: new Date() })
            .where(
              and(
                eq(scheduledMessageJobsInMessage.id, input.id),
                eq(scheduledMessageJobsInMessage.userId, ctx.getSessionPayload.user.id),
                isNull(scheduledMessageJobsInMessage.cancelledAt),
                isNull(scheduledMessageJobsInMessage.completedAt),
                sql`${scheduledMessageJobsInMessage.payload}->>'type' = ${ScheduledMessageJobType.ScheduledMessage}`,
              ),
            )
            .returning()
        )[0],
        Operation.Update,
        DatabaseEntityType.ScheduledMessageJob,
        input.id,
        "NOT_FOUND",
      );
      await isMember(ctx.db, ctx.getSessionPayload, scheduledMessageJob.roomId);
      const payload = scheduledMessageScheduledMessageJobPayloadSchema.parse(scheduledMessageJob.payload);
      return createUserMessage(ctx.db, ctx.getSessionPayload, {
        files: [],
        message: payload.message,
        roomId: scheduledMessageJob.roomId,
        type: MessageType.Message,
      });
    }),
  scheduleReminder: getMemberProcedure(scheduleReminderInputSchema, "roomId").mutation<ScheduledMessageJobInMessage>(
    async ({ ctx, input }) => {
      const job = requireMutation(
        (
          await ctx.db
            .insert(scheduledMessageJobsInMessage)
            .values({
              payload: { text: input.text, type: ScheduledMessageJobType.Reminder },
              roomId: input.roomId,
              runAt: input.runAt,
              userId: ctx.getSessionPayload.user.id,
            })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.ScheduledMessageJob,
        JSON.stringify(input),
      );
      await enqueueScheduledMessageJob(useQueueClient(AzureQueue.ScheduledMessageJobs), job.id, job.runAt);
      return job;
    },
  ),
});

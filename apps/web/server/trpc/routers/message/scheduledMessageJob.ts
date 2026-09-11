import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { MessageEntity, ScheduledMessageJobInMessage } from "@esposter/db-schema";

import { cancelScheduledMessageJobInputSchema } from "#shared/models/db/message/scheduledMessageJob/CancelScheduledMessageJobInput";
import { readMyScheduledMessageJobsInputSchema } from "#shared/models/db/message/scheduledMessageJob/ReadMyScheduledMessageJobsInput";
import { readScheduledMessageJobsInputSchema } from "#shared/models/db/message/scheduledMessageJob/ReadScheduledMessageJobsInput";
import { rescheduleMessageInputSchema } from "#shared/models/db/message/scheduledMessageJob/RescheduleMessageInput";
import { scheduleMessageInputSchema } from "#shared/models/db/message/scheduledMessageJob/ScheduleMessageInput";
import { scheduleReminderInputSchema } from "#shared/models/db/message/scheduledMessageJob/ScheduleReminderInput";
import { sendScheduledMessageNowInputSchema } from "#shared/models/db/message/scheduledMessageJob/SendScheduledMessageNowInput";
import { ownedBy } from "@@/server/services/db/ownedBy";
import { createUserMessage } from "@@/server/services/message/createUserMessage";
import { assertCanCreateMessage } from "@@/server/services/message/moderation/assertCanCreateMessage";
import { activeScheduledMessageJobWhere } from "@@/server/services/message/scheduledMessageJob/activeScheduledMessageJobWhere";
import { cancelScheduledMessageJob } from "@@/server/services/message/scheduledMessageJob/cancelScheduledMessageJob";
import { enqueueScheduledMessageJob } from "@@/server/services/message/scheduledMessageJob/enqueueScheduledMessageJob";
import { getCancellableScheduledMessageWhere } from "@@/server/services/message/scheduledMessageJob/getCancellableScheduledMessageWhere";
import { getScheduledMessageJobValues } from "@@/server/services/message/scheduledMessageJob/getScheduledMessageJobValues";
import { insertScheduledMessageJob } from "@@/server/services/message/scheduledMessageJob/insertScheduledMessageJob";
import { requireScheduledMessageJob } from "@@/server/services/message/scheduledMessageJob/requireScheduledMessageJob";
import { getBasePaginationData } from "@@/server/services/pagination/getBasePaginationData";
import { router } from "@@/server/trpc";
import { assertIsMember } from "@@/server/services/room/assertIsMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import {
  MessageType,
  roomsInMessage,
  scheduledMessageJobsInMessage,
  ScheduledMessageJobType,
  scheduledMessageScheduledMessageJobPayloadSchema,
} from "@esposter/db-schema";
import { getResultAsync, noop, Operation, WordFilteredError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, asc, count, eq } from "drizzle-orm";

export const scheduledMessageJobRouter = router({
  cancelScheduledMessageJob: standardAuthedProcedure
    .input(cancelScheduledMessageJobInputSchema)
    .mutation<ScheduledMessageJobInMessage>(({ ctx, input }) =>
      cancelScheduledMessageJob(
        ctx.db,
        and(
          ownedBy(scheduledMessageJobsInMessage, input.id, ctx.getSessionPayload.user.id),
          activeScheduledMessageJobWhere,
        ),
        input.id,
      ),
    ),
  readMyScheduledMessageJobs: standardAuthedProcedure
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
          and(eq(scheduledMessageJobsInMessage.userId, ctx.getSessionPayload.user.id), activeScheduledMessageJobWhere),
        )
        .orderBy(asc(scheduledMessageJobsInMessage.runAt))
        .limit(limit + 1)
        .offset(offset);
      return getBasePaginationData(
        rows.map(({ room, scheduledMessageJob }) => Object.assign(scheduledMessageJob, { room })),
        limit,
      );
    }),
  readMyScheduledMessageJobsCount: standardAuthedProcedure.query<number>(
    async ({ ctx }) =>
      (
        await ctx.db
          .select({ count: count() })
          .from(scheduledMessageJobsInMessage)
          .where(
            and(
              eq(scheduledMessageJobsInMessage.userId, ctx.getSessionPayload.user.id),
              activeScheduledMessageJobWhere,
            ),
          )
      )[0]?.count ?? 0,
  ),
  readScheduledMessageJobs: getMemberProcedure(readScheduledMessageJobsInputSchema, "roomId").query<
    ScheduledMessageJobInMessage[]
  >(({ ctx, input }) =>
    ctx.db
      .select()
      .from(scheduledMessageJobsInMessage)
      .where(
        and(
          eq(scheduledMessageJobsInMessage.userId, ctx.getSessionPayload.user.id),
          eq(scheduledMessageJobsInMessage.roomId, input.roomId),
          activeScheduledMessageJobWhere,
        ),
      )
      .orderBy(asc(scheduledMessageJobsInMessage.runAt)),
  ),
  rescheduleMessage: getMemberProcedure(rescheduleMessageInputSchema, "roomId").mutation<ScheduledMessageJobInMessage>(
    async ({ ctx, input }) => {
      await assertCanCreateMessage(ctx.db, ctx.getSessionPayload.user.id, input.roomId, input.message);
      const scheduledMessageJob = await ctx.db.transaction(async (tx) => {
        await cancelScheduledMessageJob(
          tx,
          getCancellableScheduledMessageWhere(input.id, ctx.getSessionPayload.user.id),
          input.id,
        );
        return insertScheduledMessageJob(
          tx,
          getScheduledMessageJobValues(input, ctx.getSessionPayload.user.id),
          JSON.stringify(input),
        );
      });
      await enqueueScheduledMessageJob(scheduledMessageJob);
      return scheduledMessageJob;
    },
  ),
  scheduleMessage: getMemberProcedure(scheduleMessageInputSchema, "roomId").mutation<ScheduledMessageJobInMessage>(
    async ({ ctx, input }) => {
      await assertCanCreateMessage(ctx.db, ctx.getSessionPayload.user.id, input.roomId, input.message);
      const scheduledMessageJob = await insertScheduledMessageJob(
        ctx.db,
        getScheduledMessageJobValues(input, ctx.getSessionPayload.user.id),
        JSON.stringify(input),
      );
      await enqueueScheduledMessageJob(scheduledMessageJob);
      return scheduledMessageJob;
    },
  ),
  scheduleReminder: getMemberProcedure(scheduleReminderInputSchema, "roomId").mutation<ScheduledMessageJobInMessage>(
    async ({ ctx, input }) => {
      const scheduledMessageJob = await insertScheduledMessageJob(
        ctx.db,
        {
          payload: { text: input.text, type: ScheduledMessageJobType.Reminder },
          roomId: input.roomId,
          runAt: input.runAt,
          userId: ctx.getSessionPayload.user.id,
        },
        JSON.stringify(input),
      );
      await enqueueScheduledMessageJob(scheduledMessageJob);
      return scheduledMessageJob;
    },
  ),
  sendScheduledMessageNow: standardAuthedProcedure
    .input(sendScheduledMessageNowInputSchema)
    .mutation<MessageEntity>(async ({ ctx, input }) => {
      const where = getCancellableScheduledMessageWhere(input.id, ctx.getSessionPayload.user.id);
      const scheduledMessageJob = requireScheduledMessageJob(
        (await ctx.db.select().from(scheduledMessageJobsInMessage).where(where).limit(1))[0],
        Operation.Update,
        input.id,
        "NOT_FOUND",
      );
      const payload = scheduledMessageScheduledMessageJobPayloadSchema.parse(scheduledMessageJob.payload);
      // Every guard `createUserMessage` would reject on runs before the job is flipped to cancelled. Checked
      // Afterwards, a rejection — non-member, slowmode, timeout, word filter — burns the job without ever
      // Sending its message, and nothing reschedules it: the send fails and the scheduled message is gone
      await assertIsMember(ctx.db, ctx.getSessionPayload, scheduledMessageJob.roomId);
      // The word filter is the exception: it already applied the room's automod action, and its inputs are
      // Both stored, so leaving the job scheduled hands the worker the same block at `runAt` — a second
      // Timeout and a second audit row for one message. Burn it here instead, exactly as the worker does
      await getResultAsync(() =>
        assertCanCreateMessage(ctx.db, ctx.getSessionPayload.user.id, scheduledMessageJob.roomId, payload.message),
      ).match(noop, async (error) => {
        if (error instanceof TRPCError && error.cause instanceof WordFilteredError)
          await ctx.db.update(scheduledMessageJobsInMessage).set({ cancelledAt: new Date() }).where(where);
        throw error;
      });
      // The claim is this update, not the select above: `getCancellableScheduledMessageWhere` excludes a job the
      // Delivery handler has already stamped, so a handler that wins the gap leaves nothing to cancel here and
      // The caller is told NOT_FOUND rather than both paths posting the same message
      await cancelScheduledMessageJob(ctx.db, where, input.id);
      // A send that fails past the guards — a transient Table write, a serialization error — must not burn the
      // Job: lifting the claim leaves the message scheduled, so the caller's error means "not sent", never "lost".
      // The delivery may have already been consumed and skipped on the tombstone, so the job is re-enqueued with
      // It; a delivery that is still pending just makes two, and the handler's single-shot claim sends once
      return getResultAsync(() =>
        createUserMessage(ctx.db, ctx.getSessionPayload, {
          files: [],
          message: payload.message,
          replyRowKey: payload.replyRowKey,
          roomId: scheduledMessageJob.roomId,
          type: MessageType.Message,
        }),
      ).match(
        (message) => message,
        async (error) => {
          // `createUserMessage` re-runs the guards, so the word filter can still block here — a moderator editing
          // The filter in the gap is enough. Rescheduling that would hand the worker the same block at `runAt`,
          // Which is the second timeout and second audit row the pre-check above burns the job to avoid
          if (error instanceof TRPCError && error.cause instanceof WordFilteredError) throw error;
          await ctx.db
            .update(scheduledMessageJobsInMessage)
            .set({ cancelledAt: null })
            .where(ownedBy(scheduledMessageJobsInMessage, input.id, ctx.getSessionPayload.user.id));
          await enqueueScheduledMessageJob(scheduledMessageJob);
          throw error;
        },
      );
    }),
});

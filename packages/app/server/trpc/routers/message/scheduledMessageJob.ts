import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";

import { cancelScheduledMessageJobInputSchema } from "#shared/models/db/message/scheduledMessageJob/CancelScheduledMessageJobInput";
import { readScheduledMessageJobsInputSchema } from "#shared/models/db/message/scheduledMessageJob/ReadScheduledMessageJobsInput";
import { scheduleMessageInputSchema } from "#shared/models/db/message/scheduledMessageJob/ScheduleMessageInput";
import { scheduleReminderInputSchema } from "#shared/models/db/message/scheduledMessageJob/ScheduleReminderInput";
import { dayjs } from "#shared/services/dayjs";
import { useQueueClient } from "@@/server/composables/azure/queue/useQueueClient";
import { assertCanCreateMessage } from "@@/server/services/message/moderation/assertCanCreateMessage";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import {
  AzureQueue,
  DatabaseEntityType,
  scheduledMessageJobQueueMessageSchema,
  scheduledMessageJobsInMessage,
  ScheduledMessageJobType,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, asc, eq, isNull } from "drizzle-orm";

const MAX_QUEUE_VISIBILITY_SECONDS = dayjs.duration(7, "days").asSeconds();

const enqueueJob = async (id: string, runAt: Date) => {
  const queueClient = useQueueClient(AzureQueue.ScheduledMessageJobs);
  const visibilityTimeout = Math.min(
    Math.max(0, Math.ceil(dayjs.duration(runAt.getTime() - Date.now()).asSeconds())),
    MAX_QUEUE_VISIBILITY_SECONDS,
  );
  await queueClient.sendMessage(JSON.stringify(scheduledMessageJobQueueMessageSchema.parse({ id })), {
    visibilityTimeout,
  });
};

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
      await enqueueJob(job.id, job.runAt);
      return job;
    },
  ),
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
      await enqueueJob(job.id, job.runAt);
      return job;
    },
  ),
});

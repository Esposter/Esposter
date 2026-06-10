import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";

import { cancelScheduledMessageJobInputSchema } from "#shared/models/db/message/scheduledMessageJob/CancelScheduledMessageJobInput";
import { readScheduledMessageJobsInputSchema } from "#shared/models/db/message/scheduledMessageJob/ReadScheduledMessageJobsInput";
import { scheduleMessageInputSchema } from "#shared/models/db/message/scheduledMessageJob/ScheduleMessageInput";
import { scheduleReminderInputSchema } from "#shared/models/db/message/scheduledMessageJob/ScheduleReminderInput";
import { assertCanCreateMessage } from "@@/server/services/message/moderation/assertCanCreateMessage";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, scheduledMessageJobsInMessage, ScheduledMessageJobType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, asc, eq, isNull } from "drizzle-orm";

export const scheduledMessageJobRouter = router({
  cancelScheduledJob: standardAuthedProcedure
    .input(cancelScheduledMessageJobInputSchema)
    .mutation<ScheduledMessageJobInMessage>(async ({ ctx, input }) => {
      return requireMutation(
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
      );
    }),
  readScheduledJobs: getMemberProcedure(readScheduledMessageJobsInputSchema, "roomId").query<
    ScheduledMessageJobInMessage[]
  >(({ ctx, input }) => {
    return ctx.db
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
      .orderBy(asc(scheduledMessageJobsInMessage.runAt));
  }),
  scheduleMessage: getMemberProcedure(scheduleMessageInputSchema, "roomId").mutation<ScheduledMessageJobInMessage>(
    async ({ ctx, input }) => {
      await assertCanCreateMessage(ctx.db, ctx.getSessionPayload.user.id, input.roomId, input.message);
      return requireMutation(
        (
          await ctx.db
            .insert(scheduledMessageJobsInMessage)
            .values({
              payload: { message: input.message },
              roomId: input.roomId,
              runAt: input.runAt,
              type: ScheduledMessageJobType.ScheduledMessage,
              userId: ctx.getSessionPayload.user.id,
            })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.ScheduledMessageJob,
        JSON.stringify(input),
      );
    },
  ),
  scheduleReminder: getMemberProcedure(scheduleReminderInputSchema, "roomId").mutation<ScheduledMessageJobInMessage>(
    async ({ ctx, input }) => {
      return requireMutation(
        (
          await ctx.db
            .insert(scheduledMessageJobsInMessage)
            .values({
              payload: { text: input.text },
              roomId: input.roomId,
              runAt: input.runAt,
              type: ScheduledMessageJobType.Reminder,
              userId: ctx.getSessionPayload.user.id,
            })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.ScheduledMessageJob,
        JSON.stringify(input),
      );
    },
  ),
});

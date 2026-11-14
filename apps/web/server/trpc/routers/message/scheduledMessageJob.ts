import type { ScheduledMessageJobInMessageWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobInMessageWithRoom";
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";
import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";

import { ownedBy } from "#server/services/db/ownedBy";
import { activeScheduledMessageJobWhere } from "#server/services/message/scheduledMessageJob/activeScheduledMessageJobWhere";
import { cancelScheduledMessageJob } from "#server/services/message/scheduledMessageJob/cancelScheduledMessageJob";
import { getActiveScheduledMessageJobsWhere } from "#server/services/message/scheduledMessageJob/getActiveScheduledMessageJobsWhere";
import { insertScheduledMessageJob } from "#server/services/message/scheduledMessageJob/insertScheduledMessageJob";
import { scheduleScheduledMessageJob } from "#server/services/message/scheduledMessageJob/scheduleScheduledMessageJob";
import { unscheduleScheduledMessageJob } from "#server/services/message/scheduledMessageJob/unscheduleScheduledMessageJob";
import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { router } from "#server/trpc";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { cancelScheduledMessageJobInputSchema } from "#shared/models/db/message/scheduledMessageJob/CancelScheduledMessageJobInput";
import { readMyScheduledMessageJobsInputSchema } from "#shared/models/db/message/scheduledMessageJob/ReadMyScheduledMessageJobsInput";
import { scheduleReminderInputSchema } from "#shared/models/db/message/scheduledMessageJob/ScheduleReminderInput";
import { roomsInMessage, scheduledMessageJobsInMessage, ScheduledMessageJobType } from "@esposter/db-schema";
import { and, asc, count, eq } from "drizzle-orm";

// Reminders are held on the Scheduler's queue in the same table. Chat messages scheduled
// for later are the scheduledMessage router's, held by their room's object
export const scheduledMessageJobRouter = router({
  cancelScheduledMessageJob: standardAuthedProcedure
    .input(cancelScheduledMessageJobInputSchema)
    .mutation<ScheduledMessageJobInMessage>(async ({ ctx, input }) => {
      const scheduledMessageJob = await cancelScheduledMessageJob(
        ctx.db,
        and(
          ownedBy(scheduledMessageJobsInMessage, input.id, ctx.getSessionPayload.user.id),
          activeScheduledMessageJobWhere,
        ),
        input.id,
      );
      await unscheduleScheduledMessageJob(input.id);
      return scheduledMessageJob;
    }),
  readMyScheduledMessageJobs: standardAuthedProcedure
    .input(readMyScheduledMessageJobsInputSchema)
    .query<OffsetPaginationData<ScheduledMessageJobInMessageWithRoom>>(async ({ ctx, input: { limit, offset } }) => {
      const rows = await ctx.db
        .select({ room: roomsInMessage, scheduledMessageJob: scheduledMessageJobsInMessage })
        .from(scheduledMessageJobsInMessage)
        .innerJoin(roomsInMessage, eq(scheduledMessageJobsInMessage.roomId, roomsInMessage.id))
        .where(getActiveScheduledMessageJobsWhere(ctx.getSessionPayload.user.id))
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
          .where(getActiveScheduledMessageJobsWhere(ctx.getSessionPayload.user.id))
      )[0]?.count ?? 0,
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
      await scheduleScheduledMessageJob(scheduledMessageJob);
      return scheduledMessageJob;
    },
  ),
});

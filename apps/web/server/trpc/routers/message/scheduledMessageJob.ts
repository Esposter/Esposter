import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";
import type { Page, ScheduledReminder } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { useUserObject } from "#server/composables/realtime/useUserObject";
import { readMyScheduledMessageJobs } from "#server/services/message/scheduledMessageJob/readMyScheduledMessageJobs";
import { getRoomActor } from "#server/services/realtime/getRoomActor";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { router } from "#server/trpc/index";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { readMyScheduledMessagesInputSchema } from "#shared/models/db/message/scheduledMessage/ReadMyScheduledMessagesInput";
import { scheduledMessageIdentityInputSchema } from "#shared/models/db/message/scheduledMessage/ScheduledMessageIdentityInput";
import { scheduleReminderInputSchema } from "#shared/models/db/message/scheduledMessageJob/ScheduleReminderInput";
import { DatabaseEntityType } from "@esposter/db-schema";
import { v7 } from "uuid";

// The Scheduled tab's rows are held by their owners: a reminder in the person's object, a scheduled message in its room's.
// Both are listed and cancelled here, so the tab reads and writes each kind through this router alone
export const scheduledMessageJobRouter = router({
  // A reminder is the person's own row, so their object answers first. A miss means the id is a scheduled message, which
  // Its room's object deletes for the sender who scheduled it and for nobody else
  cancelScheduledMessageJob: standardAuthedProcedure
    .input(scheduledMessageIdentityInputSchema)
    .mutation<void>(async ({ ctx, input: { id, roomId } }) => {
      if (await useUserObject(ctx.user.id).removeReminder(id)) return;

      const isDeleted = await useRoomObject(roomId).deleteScheduledMessage(id, getRoomActor(ctx));
      if (!isDeleted) throw getNotFoundError(DatabaseEntityType.ScheduledMessageJob, id);
    }),
  readMyScheduledMessageJobs: standardAuthedProcedure
    .input(readMyScheduledMessagesInputSchema)
    .query<Page<ScheduledMessageJobWithRoom>>(({ ctx, input }) =>
      readMyScheduledMessageJobs(ctx.db, ctx.user.id, input),
    ),
  readMyScheduledMessageJobsCount: standardAuthedProcedure.query<number>(({ ctx }) =>
    useUserObject(ctx.user.id).countScheduledMessageJobs(),
  ),
  // A reminder is written to its owner's object, which the alarm sends at `runAt`. Its room is what the notification links
  // To, so only a member of that room can set one
  scheduleReminder: getMemberProcedure(scheduleReminderInputSchema, "roomId").mutation<
    Except<ScheduledReminder, "version">
  >(async ({ ctx, input }) => {
    const reminder = { id: v7(), roomId: input.roomId, runAt: input.runAt, text: input.text };
    await useUserObject(ctx.user.id).addReminder(reminder);
    return reminder;
  }),
});

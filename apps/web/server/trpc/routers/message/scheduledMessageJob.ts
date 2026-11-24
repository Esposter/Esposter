import type { CancelScheduledMessageJobResult } from "#shared/models/db/message/scheduledMessageJob/CancelScheduledMessageJobResult";
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
import { DatabaseEntityType, ScheduledMessageJobType } from "@esposter/db-schema";
import { v7 } from "uuid";

// The Scheduled tab's rows are held by their owners.
// A reminder sits in the person's object, and a scheduled message in its room's object.
// Both are listed and cancelled here, so the tab reads and writes each kind through this router alone.
export const scheduledMessageJobRouter = router({
  // A reminder is the person's own row, so their object answers first. A miss means the id is a scheduled message.
  // The room's object tombstones that message for the sender who scheduled it and for nobody else.
  // Either answers with the tombstone it left.
  cancelScheduledMessageJob: standardAuthedProcedure
    .input(scheduledMessageIdentityInputSchema)
    .mutation<CancelScheduledMessageJobResult>(async ({ ctx, input: { id, roomId } }) => {
      const reminder = await useUserObject(ctx.user.id).removeReminder(id);
      if (reminder) return { kind: ScheduledMessageJobType.Reminder, row: reminder };

      const scheduledMessage = await useRoomObject(roomId).deleteScheduledMessage(id, getRoomActor(ctx));
      if (!scheduledMessage) throw getNotFoundError(DatabaseEntityType.ScheduledMessageJob, id);
      return { kind: ScheduledMessageJobType.ScheduledMessage, row: scheduledMessage };
    }),
  readMyScheduledMessageJobs: standardAuthedProcedure
    .input(readMyScheduledMessagesInputSchema)
    .query<Page<ScheduledMessageJobWithRoom>>(({ ctx, input }) =>
      readMyScheduledMessageJobs(ctx.db, ctx.user.id, input),
    ),
  readMyScheduledMessageJobsCount: standardAuthedProcedure.query<number>(({ ctx }) =>
    useUserObject(ctx.user.id).countScheduledMessageJobs(),
  ),
  // A reminder is written to its owner's object, which the alarm sends at `runAt`. Its room is what the notification
  // Links To, so only a member of that room can set one
  scheduleReminder: getMemberProcedure(scheduleReminderInputSchema, "roomId").mutation<
    Except<ScheduledReminder, "deletedAt" | "version">
  >(async ({ ctx, input }) => {
    const reminder = { id: v7(), roomId: input.roomId, runAt: input.runAt, text: input.text };
    await useUserObject(ctx.user.id).addReminder(reminder);
    return reminder;
  }),
});

# Scheduled message jobs architecture

Read when scheduling work to run at a future time (scheduled messages, reminders). A scheduled chat message is no longer a queue job: it is a row in its room's `RoomObject` storage, and the room's one alarm sends it when it comes due, holding it to the sender's creation rules as they stand then (`sendDueScheduledMessages` in `apps/functions/src/durableObjects/RoomObject.ts`). A TodoList reminder is a row in its owner's `UserObject`, sent from that object's alarm (`scheduleTodoReminders.ts` in `apps/web/server/services/resource/todoList/`).

**What the `ProcessScheduledMessageJob` queue still delivers**: a row in `scheduledMessageJobsInMessage` whose payload is a reminder. The handler (`apps/functions/src/handlers/processScheduledMessageJobHandler.ts`) claims it, publishes the reminder and stamps `completedAt`. A row whose payload is a chat message is skipped untouched, unclaimed, for its owner to retire.

The reminder's flow, for the rows this queue still delivers:

1. The row is in `scheduledMessageJobsInMessage` with its due time.
2. Its time is set on a Scheduler object named by the job's id, which sends `{ id }` to the queue at `runAt`. Pass `runAt` as a `Date`: an alarm set in the past fires at once.
3. The consumer reads the row, atomically claims it on `processingStartedAt IS NULL` (the single-shot claim that makes the handler idempotent under at-least-once delivery), publishes the reminder, and marks `completedAt`. If `job.runAt` is still in the future it schedules the job again instead of executing.
4. A cancel clears the row, so the handler skips a cancelled row whether or not its alarm was cleared.

**No timer function** — the alarm is the due time, so nothing polls for due jobs.

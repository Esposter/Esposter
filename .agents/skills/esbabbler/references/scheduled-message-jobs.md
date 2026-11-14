# Scheduled message jobs architecture

Read when scheduling work to run at a future time (scheduled messages, reminders). A scheduled job is two pieces: a row in `scheduledMessageJobsInMessage`, which the delivery handler reads, and a **Scheduler Durable Object** whose alarm fires at the due time and sends the job to its queue.

**Flow**:

1. A tRPC mutation (`apps/web/server/trpc/routers/message/scheduledMessageJob.ts`) inserts a row into `scheduledMessageJobsInMessage`.
2. The same mutation calls `scheduleScheduledMessageJob(job)` (`apps/web/server/services/message/scheduledMessageJob/`), which calls `schedule(runAt, job)` on the Scheduler object named by the job's id (`useScheduler(id)`). The object stores the job and sets its alarm at `runAt`. Pass `runAt` as a `Date`: an alarm set in the past fires at once.
3. When the alarm fires, the Scheduler object sends `{ id }` to the `ProcessScheduledMessageJob` queue. The functions Worker's consumer reads the row, atomically claims it on `processingStartedAt IS NULL` (the single-shot claim that makes the handler idempotent under at-least-once delivery), executes, and marks `completedAt`. If `job.runAt` is still in the future it schedules the job again instead of executing.
4. A cancel or a send-now clears the row, then clears the object's alarm with `unscheduleScheduledMessageJob`. That clear is best-effort: the handler skips a cancelled row whether or not its alarm was cleared.

**No timer function** — the alarm is the due time, so nothing polls for due jobs.

**Scheduler object** — `apps/functions/src/durableObjects/Scheduler.ts`, one per job id. A reschedule replaces its job and alarm; a cancel removes both. A TodoList reminder does not use it: `apps/web/server/services/resource/todoList/scheduleTodoReminders.ts` gives the reminder to the resource owner's `UserObject`, which keeps it in `todoRemindersInUser` and sends it from its one alarm.

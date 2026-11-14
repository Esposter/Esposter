# Scheduled message jobs architecture

Read when scheduling work to run at a future time: a scheduled chat message or a reminder. Each is held by the object that owns it, and that object's one alarm sends it. There is no queue, no Scheduler object and no timer function.

- **A scheduled message** is a row in its room's `RoomObject`. The room's alarm sends every row that is due (`sendDueScheduledMessages` in `apps/functions/src/durableObjects/RoomObject.ts`), holding it to the sender's creation rules as they stand at that moment. The sender's `UserObject` keeps an index of the rooms they have rows in (`scheduledMessagesInUser`), which the Scheduled tab reads. The index is not what sends anything.
- **A reminder** is a row in its owner's `UserObject`, in `remindersInUser` (`id`, `roomId`, `runAt`, `text`). The object's alarm (`alarm()` in `apps/functions/src/durableObjects/UserObject.ts`) sends the due reminders and the due TodoList reminders, then arms itself for the earliest row still ahead.

The reminder's flow:

1. `scheduleReminder` calls `addReminder` on the sender's `UserObject`. That inserts the row and arms the alarm for its `runAt`.
2. At `runAt`, `sendDueReminders` publishes a notification (`AppNotificationType.Reminder`) through `PROCESS_NOTIFICATION_QUEUE`, linked to the room, and deletes the row only once the publish has succeeded.
3. A failed publish keeps the row. The alarm is re-armed `REMINDER_RETRY_DELAY_MS` later (`apps/functions/src/services/reminder/constants.ts`), so a row that stays overdue is never left without an alarm.
4. `cancelScheduledMessageJob` on a reminder calls `removeReminder`, which deletes the row and re-arms the alarm, so cancelling the next-due reminder moves the alarm to the one after it.

Delivery is at least once. A crash between the publish and the delete publishes the reminder again on the retry. The notification's own retries and delivery belong to the notification path ([notifications](../../../../openspec/specs/architecture/notifications/design.md)).

The Scheduled tab reads both kinds through `message.scheduledMessageJob.readMyScheduledMessageJobs` and counts them through `readMyScheduledMessageJobsCount`. Both merge the index with the reminders, and a row whose room no longer exists is left out.

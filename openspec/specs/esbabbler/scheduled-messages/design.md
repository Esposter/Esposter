# Scheduled Messages & Reminders

Two things are scheduled, and each is held where its owner lives. **A scheduled message** is a row in its room's object, which sends it when it comes due. **A reminder** (`/remind`) is a self-addressed notification held as a row in D1 and fired by the `Scheduler` object at `runAt`. Neither is a queue message that carries the work itself.

## Scheduled messages — held by their room

Procedures under `message.scheduledMessage.`:

| Procedure                                                            | Notes                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createScheduledMessage({ roomId, message, replyToId?, runAt })`     | behind `assertCanCreateMessage` at creation; the router mints the row's id and the room's object stores the row                                                                                                                                                             |
| `updateScheduledMessage({ id, roomId, message, replyToId?, runAt })` | the same creation guard; the object replaces the row's text, reply target and time                                                                                                                                                                                          |
| `deleteScheduledMessage({ id, roomId })`                             | the object deletes the row; a row that is not there is not found                                                                                                                                                                                                            |
| `sendScheduledMessageNow({ id, roomId })`                            | reads the row, runs the creation guards, then claims it by deleting it in the object and posts through `createUserMessage`. A word-filter block deletes the row, so the blocked message is not kept for a second block. Any other failure after the claim puts the row back |
| `readScheduledMessages({ roomId })`                                  | the room's object, for the sender only                                                                                                                                                                                                                                      |
| `readMyScheduledMessages({ limit, offset })`                         | the sender's `UserObject` index names the rooms they have rows in; each room's object is read in parallel and the rows are joined to their rooms (Scheduled tab → [drafts & sent](../drafts-and-sent/design.md))                                                            |
| `readMyScheduledMessagesCount()`                                     | the length of the same index                                                                                                                                                                                                                                                |

A row is sent by its room's alarm. `RoomObject.alarm` runs every row that is due, in one synchronous transaction per row: the row is deleted and its message is written, so a row is sent once or dropped once. The sender's rules are read from D1 at that moment (`getMessageCreationRejection`). A rule that rejects the send, and a read that faults, both drop the row and send nothing, since a message is never sent on a check that did not pass. A sent message then owes what a live reply owes: its thread's follows are written, its notification is published, and the sender's slowmode clock advances. The sender's `UserObject` is told to drop the row from its index and to index the sent message.

Because the rules are re-read when the row comes due, a member who has lost their membership or their send permission by then never sends the message.

## Reminders — held in D1 and fired by the Scheduler

Procedures under `message.scheduledMessageJob.`:

| Procedure                                       | Notes                                                                                                         |
| ----------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `scheduleReminder({ roomId, runAt, text })`     | inserts a job row, then has the `Scheduler` object for that row alarm at `runAt`. Behind `getMemberProcedure` |
| `cancelScheduledMessageJob({ id })`             | tombstones the row with `cancelledAt` and cancels the `Scheduler`'s alarm                                     |
| `readMyScheduledMessageJobs({ offset, limit })` | the caller's active reminders across rooms, soonest first                                                     |
| `readMyScheduledMessageJobsCount()`             | the same count, for the tab badge                                                                             |

A reminder's `Scheduler` alarm sends its job id to the `ProcessScheduledMessageJob` queue at `runAt`, and the delivery handler does the rest. The handler reads the row and skips it when it is cancelled, completed or already claimed. A row whose `runAt` is still ahead is handed back to its `Scheduler`. Otherwise the handler claims it: it stamps `processingStartedAt` only while `cancelledAt`, `completedAt` and `processingStartedAt` are all still null, so of two concurrent deliveries exactly one proceeds. The claimed reminder is published as a notification, best-effort, and `completedAt` is stamped.

The claim splits the retries. A failure before the claim leaves the row unclaimed, so the queue redelivers it. A failure after the claim is not retried, because the redelivery would be skipped by the claim itself. The reminder notification is published like every other notification, so its own retries belong to the notification queue ([notifications](../../architecture/notifications/design.md)).

The handler skips any row that is not a reminder. The `payload` column still names the earlier scheduled-message kind, and no current procedure writes one.

## Data model

Table `scheduledMessageJobsInMessage` holds reminders:

| Column                | Meaning                                                                               |
| --------------------- | :------------------------------------------------------------------------------------ |
| `id`                  | UUID primary key, the only thing the `Scheduler` puts on the queue                    |
| `userId`              | the person the reminder is for                                                        |
| `roomId`              | the room the reminder was set in, which its notification links to                     |
| `payload`             | discriminated JSON by `type`; a reminder carries `text`                               |
| `runAt`               | when the reminder is due                                                              |
| `processingStartedAt` | nullable; the delivery handler's single-shot claim                                    |
| `completedAt`         | nullable; set once the reminder has been published                                    |
| `cancelledAt`         | nullable; set by `cancelScheduledMessageJob`; the handler skips a row where it is set |

## Key files

| File                                                                     | Role                                           |
| :----------------------------------------------------------------------- | :--------------------------------------------- |
| `apps/web/server/trpc/routers/message/scheduledMessage.ts`               | scheduled messages: create, edit, send, list   |
| `apps/functions/src/durableObjects/RoomObject.ts`                        | holds, sends and drops a room's scheduled rows |
| `apps/web/server/trpc/routers/message/scheduledMessageJob.ts`            | reminders: schedule, cancel, list              |
| `apps/functions/src/durableObjects/Scheduler.ts`                         | fires a reminder's job id at `runAt`           |
| `apps/functions/src/handlers/processScheduledMessageJobHandler.ts`       | reminder delivery and its claim                |
| `packages/db-schema/src/schema/message/scheduledMessageJobsInMessage.ts` | reminder rows                                  |

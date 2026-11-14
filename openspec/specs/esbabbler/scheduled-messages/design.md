# Scheduled Messages & Reminders

Two things are scheduled, and each is held by the object that owns it, which sends it from its one alarm. **A scheduled message** is a row in its room's object. **A reminder** (`/remind`) is a row in its owner's object, sent to them as a notification. Neither is a queue message, and no Scheduler object holds a timer for either.

## Scheduled messages — held by their room

Procedures under `message.scheduledMessage.`:

| Procedure                                                            | Notes                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createScheduledMessage({ roomId, message, replyToId?, runAt })`     | behind `assertCanCreateMessage` at creation; the router mints the row's id and the room's object stores the row                                                                                                                                                             |
| `updateScheduledMessage({ id, roomId, message, replyToId?, runAt })` | the same creation guard; the object replaces the row's text, reply target and time                                                                                                                                                                                          |
| `deleteScheduledMessage({ id, roomId })`                             | the object deletes the row; a row that is not there is not found                                                                                                                                                                                                            |
| `sendScheduledMessageNow({ id, roomId })`                            | reads the row, runs the creation guards, then claims it by deleting it in the object and posts through `createUserMessage`. A word-filter block deletes the row, so the blocked message is not kept for a second block. Any other failure after the claim puts the row back |
| `readScheduledMessages({ roomId })`                                  | the room's object, for the sender only                                                                                                                                                                                                                                      |

A row is sent by its room's alarm. `RoomObject.alarm` runs every row that is due, in one synchronous transaction per row: the row is deleted and its message is written, so a row is sent once or dropped once. The sender's rules are read from D1 at that moment (`getMessageCreationRejection`). A rule that rejects the send, and a read that faults, both drop the row and send nothing, since a message is never sent on a check that did not pass. A sent message then owes what a live reply owes: its thread's follows are written, its notification is published, and the sender's slowmode clock advances. The sender's `UserObject` is told to drop the row from its index and to index the sent message.

Because the rules are re-read when the row comes due, a member who has lost their membership or their send permission by then never sends the message.

## Reminders — held by their owner

Procedures under `message.scheduledMessageJob.`:

| Procedure                                       | Notes                                                                                                                                                                               |
| ----------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scheduleReminder({ roomId, runAt, text })`     | behind `getMemberProcedure`; writes the row to the caller's `UserObject`, which arms its alarm for `runAt`                                                                          |
| `cancelScheduledMessageJob({ id, roomId })`     | the caller's object removes the reminder with that id, and the room's object removes a scheduled message with it; a reminder cancel re-arms the object's alarm for the one after it |
| `readMyScheduledMessageJobs({ offset, limit })` | the caller's index of scheduled messages and their reminders, merged and soonest first, joined to their rooms                                                                       |
| `readMyScheduledMessageJobsCount()`             | the same count, for the tab badge                                                                                                                                                   |

The caller's `UserObject` answers a cancel first. A miss means the id is a scheduled message, which its room's object deletes for the sender who scheduled it and for nobody else.

A reminder is sent by its owner's alarm. `UserObject.alarm` sends every reminder that is due, and each one is published as a notification to the person, linked to the room it was set in. The row is deleted only once the publish has succeeded. A failed publish keeps the row, and the alarm re-arms a retry shortly after, so an overdue row is never left without one. The alarm then arms for the earliest row still ahead, reminders and TodoList reminders alike. The notification's own delivery is the notification path's ([notifications](../../architecture/notifications/design.md)).

Delivery is at least once: a crash between the publish and the delete publishes the reminder again on the retry.

## Data model

Scheduled messages are held in two places, and the reminders in a third:

| Table                     | Object       | Holds                                                                                                                                                  |
| ------------------------- | :----------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scheduledMessages`       | `RoomObject` | a room's scheduled messages: `id`, `message`, `replyToId`, `runAt`, `userId`. The room's alarm sends them                                              |
| `scheduledMessagesInUser` | `UserObject` | the index of a person's scheduled messages by `scheduledId`: `roomId` and `runAt`, so the Scheduled tab can read them. The alarm does not send from it |
| `remindersInUser`         | `UserObject` | a person's reminders: `id`, `roomId`, `runAt`, `text`. The object's alarm sends them                                                                   |

## Key files

| File                                                                                 | Role                                                                  |
| :----------------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `apps/web/server/trpc/routers/message/scheduledMessage.ts`                           | scheduled messages: create, edit, send, delete, list one room's       |
| `apps/functions/src/durableObjects/RoomObject.ts`                                    | holds, sends and drops a room's scheduled messages                    |
| `apps/web/server/trpc/routers/message/scheduledMessageJob.ts`                        | the Scheduled tab's rows and reminders: schedule, cancel, list, count |
| `apps/web/server/services/message/scheduledMessageJob/readMyScheduledMessageJobs.ts` | the merged, joined read behind the Scheduled tab                      |
| `apps/functions/src/durableObjects/UserObject.ts`                                    | holds a person's reminders, sends them from its alarm, re-arms it     |
| `apps/functions/src/durableObjects/user/schema.ts`                                   | the `remindersInUser` and `scheduledMessagesInUser` tables            |

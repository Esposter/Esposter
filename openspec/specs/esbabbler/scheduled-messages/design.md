# Scheduled Messages & Reminders

Two things are scheduled, and each is held by the object that owns it, which sends it from its one alarm. **A scheduled message** is a row in its room's object. **A reminder** (`/remind`) is a row in its owner's object, sent to them as a notification. Neither is a queue message, and no Scheduler object holds a timer for either.

## Scheduled messages — held by their room

Procedures under `message.scheduledMessage.`:

| Procedure                                                            | Notes                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createScheduledMessage({ roomId, message, replyToId?, runAt })`     | behind `assertCanCreateMessage` at creation; the router mints the row's id and the room's object stores the row                                                                                                                                                                                                                                           |
| `updateScheduledMessage({ id, roomId, message, replyToId?, runAt })` | the same creation guard; the object replaces the row's text, reply target and time                                                                                                                                                                                                                                                                        |
| `deleteScheduledMessage({ id, roomId })`                             | the object tombstones the row (`deletedAt` set, its text cleared); a row that is not live is not found                                                                                                                                                                                                                                                    |
| `sendScheduledMessageNow({ id, roomId })`                            | reads the row, runs the creation guards, then claims it by tombstoning it in the object and posts through `createUserMessage`, answering with the tombstone. A word-filter block tombstones the row, so the blocked message is not kept for a second block. Any other failure after the claim puts the row back under its id, which revives its tombstone |
| `readScheduledMessages({ roomId })`                                  | the room's object, for the sender only                                                                                                                                                                                                                                                                                                                    |

A row is sent by its room's alarm. `RoomObject.alarm` runs every row that is due, in one synchronous transaction per row: the row is tombstoned and its message is written, so a row is sent once or dropped once. The sender's rules are read from D1 at that moment (`getMessageCreationRejection`). A rule that rejects the send, and a read that faults, both drop the row and send nothing, since a message is never sent on a check that did not pass. The sender's slowmode clock is claimed before the message is written, as a live send claims it, so a row whose claim faults is dropped. Its mentions and link preview are read from its text at that send, as a live send's are. A sent message then owes what a live send owes: the sender's `UserObject` is told to tombstone the row and to index the sent message, its mention counts are written, its thread's follows are written, and its notification is published.

Because the rules are re-read when the row comes due, a member who has lost their membership or their send permission by then never sends the message.

A room's delete takes every scheduled message in the room with it, other people's too. The room's object returns the senders whose messages it removed, and the delete publishes each sender's scheduled-message topic before the room's row goes, so a sender's list is told even when the row's delete then fails. The account sweep's owned-room step publishes the same way.

## Reminders — held by their owner

Procedures under `message.scheduledMessageJob.`:

| Procedure                                       | Notes                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scheduleReminder({ roomId, runAt, text })`     | behind `getMemberProcedure`; writes the row to the caller's `UserObject`, which arms its alarm for `runAt`                                                                                                                                                                                            |
| `cancelScheduledMessageJob({ id, roomId })`     | the caller's object tombstones the reminder with that id, and the room's object tombstones a scheduled message with it; a reminder cancel re-arms the object's alarm for the one after it, and the answer is the tombstone                                                                            |
| `readMyScheduledMessageJobs({ cursor, limit })` | the caller's index of scheduled messages and their reminders, merged and soonest first. A row is listed only while the caller is still a member of its room, with its room read from it; a scheduled message's text and time are read from that room. An index row its room no longer holds is pruned |
| `readMyScheduledMessageJobsCount()`             | the same count, for the tab badge                                                                                                                                                                                                                                                                     |

The caller's `UserObject` answers a cancel first. A miss means the id is a scheduled message, which its room's object deletes for the sender who scheduled it and for nobody else.

A person who leaves a room takes what they scheduled in it with them. Each departure (a leave, a removal, a ban, or the room's deletion) reaches the room's object, which tombstones that member's scheduled messages in the room and tells the member's object to tombstone its reminders and index entries for the room, re-arming its alarm for what is left. So no reminder of theirs for the room fires after they have left, and the room's own send checks that its sender is still a member remain as the second guard.

A reminder is sent by its owner's alarm. `UserObject.alarm` sends every reminder that is due, and each one is published as a notification to the person, linked to the room it was set in. The row is tombstoned only once the publish has succeeded. A failed publish keeps the row, and the alarm re-arms a retry shortly after, so an overdue row is never left without one. The alarm then arms for the earliest row still ahead, reminders and TodoList reminders alike. The notification's own delivery is the notification path's ([notifications](../../architecture/notifications/design.md)).

Delivery is at least once: a crash between the publish and the tombstone publishes the reminder again on the retry.

**Tombstones.** A cancel, a send and a due send each leave their row as a tombstone (`deletedAt` set, its text cleared, its version raised) rather than a delete. No read returns a tombstone and no alarm sends one. A reschedule names a live row only, so it does not bring back a cancelled or a sent message, since both leave the same tombstone; only a put-back under the same id, which a failed send makes, revives a claimed row. Each object's alarm removes a tombstone once the tombstone retention has passed, and arms for the oldest one's expiry, as the overlay design's object tombstone decision records.

## Data model

Scheduled messages are held in two places, and the reminders in a third:

| Table                     | Object       | Holds                                                                                                                                                                                                                                                      |
| ------------------------- | :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scheduledMessages`       | `RoomObject` | a room's scheduled messages: `id`, `message`, `replyToId`, `runAt`, `userId`. The room's alarm sends them                                                                                                                                                  |
| `scheduledMessagesInUser` | `UserObject` | the index of a person's scheduled messages by `scheduledId`: `roomId` and `runAt`, so the Scheduled tab can page them soonest first. The room's row owns the text and the time; the index is repaired from it on read, and the alarm does not send from it |
| `remindersInUser`         | `UserObject` | a person's reminders: `id`, `roomId`, `runAt`, `text`. The object's alarm sends them                                                                                                                                                                       |

## Key files

| File                                                                                 | Role                                                                  |
| :----------------------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `apps/web/server/trpc/routers/message/scheduledMessage.ts`                           | scheduled messages: create, edit, send, delete, list one room's       |
| `apps/realtime/src/durableObjects/RoomObject.ts`                                     | holds, sends and drops a room's scheduled messages                    |
| `apps/web/server/trpc/routers/message/scheduledMessageJob.ts`                        | the Scheduled tab's rows and reminders: schedule, cancel, list, count |
| `apps/web/server/services/message/scheduledMessageJob/readMyScheduledMessageJobs.ts` | the merged, joined read behind the Scheduled tab                      |
| `apps/realtime/src/durableObjects/UserObject.ts`                                     | holds a person's reminders, sends them from its alarm, re-arms it     |
| `packages/db-schema/src/objects/user/schema.ts`                                      | the `remindersInUser` and `scheduledMessagesInUser` tables            |

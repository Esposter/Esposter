import type { Context } from "#server/trpc/context";
import type { ReadMyScheduledMessagesInput } from "#shared/models/db/message/scheduledMessage/ReadMyScheduledMessagesInput";
import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";
import type { Page } from "@esposter/db-schema";

import { useUserObject } from "#server/composables/realtime/useUserObject";
import { fanOutRoomReads } from "#server/services/message/fanOutRoomReads";
import { compareBySort, inJsonArray, toPage } from "@esposter/db";
import {
  getLiveRowWhere,
  roomsInMessage,
  SCHEDULED_MESSAGE_JOB_PAGE_SORT,
  ScheduledMessageJobType,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { getOrCreate, getResultAsync, noop } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// The Scheduled tab's rows are both kinds of scheduled item, each held where its owner is: the person's reminders and the
// Index of their scheduled messages, both in their own object. The page is the first rows of the two merged soonest first,
// Read from each owner's keyset. A row is listed only while the person is still a member of its room, which is where its
// Room's details are read from, since leaving the room takes its rows out of the person's object. A scheduled message's text
// And time are read from its room, and a scheduled message whose room no longer holds it is pruned from the index, so the
// List and its count stop naming it
export const readMyScheduledMessageJobs = async (
  db: Context["db"],
  userId: string,
  { cursor, limit }: ReadMyScheduledMessagesInput,
): Promise<Page<ScheduledMessageJobWithRoom>> => {
  const userObject = useUserObject(userId);
  const [indexedScheduledMessages, reminders] = await Promise.all([
    userObject.readScheduledMessages({ cursor, limit: limit + 1 }),
    userObject.readReminders({ cursor, limit: limit + 1 }),
  ]);
  const page = toPage(
    [
      ...indexedScheduledMessages.map((scheduledMessage) => ({ ...scheduledMessage, isReminder: false as const })),
      ...reminders.map((reminder) => ({ ...reminder, isReminder: true as const })),
    ].toSorted(compareBySort(SCHEDULED_MESSAGE_JOB_PAGE_SORT)),
    SCHEDULED_MESSAGE_JOB_PAGE_SORT,
    cursor,
    limit,
  );

  // The rooms the page names are read only for the ones the person is still a member of, so a room they have left gives its
  // Details to nobody
  const roomIds = [...new Set(page.items.map(({ roomId }) => roomId))];
  const memberRooms =
    roomIds.length > 0
      ? await db
          .select({ room: roomsInMessage })
          .from(usersToRoomsInMessage)
          .innerJoin(roomsInMessage, eq(roomsInMessage.id, usersToRoomsInMessage.roomId))
          .where(
            and(
              eq(usersToRoomsInMessage.userId, userId),
              inJsonArray(usersToRoomsInMessage.roomId, roomIds),
              getLiveRowWhere(usersToRoomsInMessage),
            ),
          )
      : [];
  const memberRoomMap = new Map(memberRooms.map(({ room }) => [room.id, room]));

  const scheduledItems = page.items.filter((item) => !item.isReminder && memberRoomMap.has(item.roomId));
  const roomIdScheduledIdsMap = new Map<string, string[]>();
  for (const item of scheduledItems) getOrCreate(roomIdScheduledIdsMap, item.roomId, () => []).push(item.id);
  const messagesByRoomId = await fanOutRoomReads([...roomIdScheduledIdsMap.keys()], (roomObject, roomId) =>
    roomObject.readScheduledMessages({ ids: roomIdScheduledIdsMap.get(roomId) ?? [], userId }),
  );
  const messageMap = new Map([...messagesByRoomId.values()].flat().map((message) => [message.id, message]));

  // A row the index names whose room no longer holds its message is stale: its send or cancel removed the message and
  // Missed the index. The read repairs it, and a failed repair is logged and left for the next read
  await Promise.all(
    scheduledItems
      .filter((item) => !messageMap.has(item.id))
      .map((item) =>
        getResultAsync(() => userObject.removeScheduledMessage(item.id)).match(noop, (error) => {
          console.error("A stale scheduled message failed to leave the index", { error, id: item.id, userId });
        }),
      ),
  );

  return {
    items: page.items.flatMap((item): ScheduledMessageJobWithRoom[] => {
      const room = memberRoomMap.get(item.roomId);
      if (!room) return [];
      if (item.isReminder)
        return [
          {
            id: item.id,
            payload: { text: item.text, type: ScheduledMessageJobType.Reminder } as const,
            room,
            roomId: item.roomId,
            runAt: item.runAt,
            version: item.version,
          },
        ];

      const scheduledMessage = messageMap.get(item.id);
      if (!scheduledMessage) return [];
      return [
        {
          id: item.id,
          payload: {
            message: scheduledMessage.message,
            replyToId: scheduledMessage.replyToId,
            type: ScheduledMessageJobType.ScheduledMessage,
          } as const,
          room,
          roomId: item.roomId,
          runAt: scheduledMessage.runAt,
          version: scheduledMessage.version,
        },
      ];
    }),
    nextCursor: page.nextCursor,
  };
};

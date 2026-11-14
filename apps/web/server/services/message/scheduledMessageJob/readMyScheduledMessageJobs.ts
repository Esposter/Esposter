import type { Context } from "#server/trpc/context";
import type { ReadMyScheduledMessagesInput } from "#shared/models/db/message/scheduledMessage/ReadMyScheduledMessagesInput";
import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";
import type { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

import { useUserObject } from "#server/composables/realtime/useUserObject";
import { fanOutRoomReads } from "#server/services/message/fanOutRoomReads";
import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { inJsonArray } from "@esposter/db";
import { roomsInMessage, ScheduledMessageJobType } from "@esposter/db-schema";

// The Scheduled tab's rows are both kinds of scheduled item, each held where its owner is: the person's reminders in their
// Own object, and their scheduled messages in the rooms they are for, indexed in their object. The page is those merged,
// Soonest first, and a row whose room is gone is left out
export const readMyScheduledMessageJobs = async (
  db: Context["db"],
  userId: string,
  { limit, offset }: ReadMyScheduledMessagesInput,
): Promise<BasePaginationData<ScheduledMessageJobWithRoom>> => {
  const userObject = useUserObject(userId);
  const [indexedScheduledMessages, reminders] = await Promise.all([
    userObject.readScheduledMessages(),
    userObject.readReminders(),
  ]);
  const messagesByRoomId = await fanOutRoomReads(
    indexedScheduledMessages.map(({ roomId }) => roomId),
    (roomObject) => roomObject.readScheduledMessages(userId),
  );
  const roomIds = [...new Set([...messagesByRoomId.keys(), ...reminders.map(({ roomId }) => roomId)])];
  const rooms =
    roomIds.length > 0 ? await db.select().from(roomsInMessage).where(inJsonArray(roomsInMessage.id, roomIds)) : [];
  const roomMap = new Map(rooms.map((room) => [room.id, room]));
  const scheduledMessageJobs = [
    ...[...messagesByRoomId].flatMap(([roomId, messages]) =>
      messages.map(({ id, message, replyToId, runAt }) => ({
        id,
        payload: { message, replyToId, type: ScheduledMessageJobType.ScheduledMessage } as const,
        roomId,
        runAt,
      })),
    ),
    ...reminders.map(({ id, roomId, runAt, text }) => ({
      id,
      payload: { text, type: ScheduledMessageJobType.Reminder } as const,
      roomId,
      runAt,
    })),
  ].flatMap((scheduledMessageJob) => {
    const room = roomMap.get(scheduledMessageJob.roomId);
    return room ? [{ ...scheduledMessageJob, room }] : [];
  });
  const soonestFirst = scheduledMessageJobs.toSorted(
    (firstScheduledMessageJob, secondScheduledMessageJob) =>
      firstScheduledMessageJob.runAt.getTime() - secondScheduledMessageJob.runAt.getTime(),
  );
  return getBasePaginationData(soonestFirst.slice(offset, offset + limit + 1), limit);
};

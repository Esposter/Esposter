import type { ReadMySentMessagesInput } from "#shared/models/db/message/ReadMySentMessagesInput";
import type { ReadMySentMessagesResult } from "#shared/models/db/message/ReadMySentMessagesResult";
import type { Database } from "@esposter/db-schema";

import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { inJsonArray } from "@esposter/db";
import { roomsInMessage, messagesInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export const readMySentMessages = async (
  { limit, offset }: ReadMySentMessagesInput,
  db: Database,
  userId: string,
): Promise<ReadMySentMessagesResult> => {
  const where = and(eq(messagesInMessage.userId, userId), isNull(messagesInMessage.deletedAt));
  const [messages, totals] = await Promise.all([
    db
      .select()
      .from(messagesInMessage)
      .where(where)
      .orderBy(desc(messagesInMessage.createdAt), desc(messagesInMessage.id))
      .limit(limit + 1)
      .offset(offset),
    db.select({ count: count() }).from(messagesInMessage).where(where),
  ]);
  const { hasMore, items } = getBasePaginationData(messages, limit);
  // Named off the page rather than the read, so the row that only answered `hasMore` never widens the join
  const roomIds = [...new Set(items.map(({ roomId }) => roomId))];
  const rooms =
    roomIds.length > 0 ? await db.select().from(roomsInMessage).where(inJsonArray(roomsInMessage.id, roomIds)) : [];
  const roomMap = new Map(rooms.map((room) => [room.id, room]));
  return {
    count: takeOne(totals, 0).count,
    data: {
      hasMore,
      items: items.flatMap((message) => {
        const room = roomMap.get(message.roomId);
        return room ? [{ message, room }] : [];
      }),
    },
  };
};

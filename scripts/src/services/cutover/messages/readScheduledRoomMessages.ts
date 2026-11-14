import type { D1Executor } from "#src/models/cutover/D1Executor";
import type { RoomImport } from "@esposter/db-schema";

import { scheduledMessageJobsInMessage, ScheduledMessageJobType } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { z } from "zod";

const scheduledMessagePayloadSchema = z.object({ message: z.string(), replyRowKey: z.string() });

// The pending scheduled messages of one room, read from the copied job rows: each neither sent nor cancelled. A reply names its root by
// the root's row key, which is the number the root was given in the room
export const readScheduledRoomMessages = async (
  executor: D1Executor,
  roomId: string,
  rewrite: (text: string) => string,
  getNumber: (rowKey: string) => number | undefined,
): Promise<RoomImport["scheduledMessages"]> => {
  const rows = await executor.query({
    params: [roomId, ScheduledMessageJobType.ScheduledMessage],
    sql: `SELECT "id", "payload", "runAt", "userId" FROM "${getTableName(scheduledMessageJobsInMessage)}" WHERE "roomId" = ? AND "completedAt" IS NULL AND "cancelledAt" IS NULL AND json_extract("payload", '$.type') = ?`,
  });
  return rows.map((row) => {
    const { message, replyRowKey } = scheduledMessagePayloadSchema.parse(JSON.parse(String(row.payload)));
    return {
      id: String(row.id),
      message: rewrite(message),
      replyToId: replyRowKey === "" ? null : (getNumber(replyRowKey) ?? null),
      runAt: new Date(Number(row.runAt)),
      userId: String(row.userId),
    };
  });
};

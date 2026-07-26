import { db } from "@/services/db";
import { getTableClient } from "@/services/getTableClient";
import { executeAutomodAction, hasPermission } from "@esposter/db";
import { AzureTable, DatabaseEntityType, RoomPermission } from "@esposter/db-schema";
import { InvalidOperationError, Operation, WordFilteredError } from "@esposter/shared";

export const assertCanCreateMessage = async (userId: string, roomId: string, message: string): Promise<void> => {
  const [room, member, filter] = await Promise.all([
    db.query.roomsInMessage.findFirst({
      columns: { isReadOnly: true, slowmodeMs: true },
      where: { id: { eq: roomId } },
    }),
    db.query.usersToRoomsInMessage.findFirst({
      columns: { lastMessageAt: true, timeoutUntil: true },
      where: { roomId: { eq: roomId }, userId: { eq: userId } },
    }),
    db.query.roomFiltersInMessage.findFirst({
      columns: { action: true, timeoutDurationMs: true, words: true },
      where: { roomId: { eq: roomId } },
    }),
  ]);
  if (!room || !member)
    throw new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId);

  const canManageMessages = await hasPermission(db, userId, roomId, RoomPermission.ManageMessages);
  if (member.timeoutUntil && member.timeoutUntil > new Date())
    throw new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId);
  else if (room.isReadOnly && !canManageMessages)
    throw new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId);
  else if (room.slowmodeMs && !canManageMessages && member.lastMessageAt) {
    const elapsedMs = Date.now() - member.lastMessageAt.getTime();
    if (elapsedMs < room.slowmodeMs)
      throw new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId);
  }

  if (!canManageMessages && filter?.words.some((word) => message.toLowerCase().includes(word.toLowerCase()))) {
    // A scheduled send that trips the filter carries the same consequence a live one does — the configured
    // Warn/Timeout is applied and audited here, since this is where the message is rejected.
    await executeAutomodAction(db, () => getTableClient(AzureTable.ModerationLog), {
      action: filter.action,
      roomId,
      timeoutDurationMs: filter.timeoutDurationMs,
      userId,
    });
    throw new WordFilteredError(
      new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId).message,
    );
  }
};

import { db } from "@/services/db";
import { hasPermission } from "@/services/message/rbac/hasPermission";
import { DatabaseEntityType, RoomPermission } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

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
      columns: { words: true },
      where: { roomId: { eq: roomId } },
    }),
  ]);
  if (!room || !member)
    throw new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId);

  const canManageMessages = await hasPermission(userId, roomId, RoomPermission.ManageMessages);
  if (member.timeoutUntil && member.timeoutUntil > new Date())
    throw new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId);
  else if (room.isReadOnly && !canManageMessages)
    throw new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId);
  else if (room.slowmodeMs && !canManageMessages && member.lastMessageAt) {
    const elapsedMs = Date.now() - member.lastMessageAt.getTime();
    if (elapsedMs < room.slowmodeMs)
      throw new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId);
  }

  if (!canManageMessages && filter?.words.some((word) => message.toLowerCase().includes(word.toLowerCase())))
    throw new InvalidOperationError(Operation.Create, DatabaseEntityType.ScheduledMessageJob, roomId);
};

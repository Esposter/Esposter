import type { MessageCreationRejection } from "#src/models/message/moderation/MessageCreationRejection";
import type { Database } from "@esposter/db-schema";

import { checkHasPermission } from "#src/services/room/rbac/checkHasPermission";
import { MessageCreationRejectionType, RoomPermission } from "@esposter/db-schema";
import { getOrCreate } from "@esposter/shared";

// The gate every message-producing path decides with, in precedence order: a timeout outranks everything,
// Then the sender's `SendMessages`, then the room's read-only flag, its slowmode, and finally the word filter.
// It returns the decision rather than throwing, so each caller can raise the error its own transport speaks:
// `TRPCError` in the app, a domain error in the Function worker. The rules themselves exist exactly once.
// A second copy of these rules is how the live path and the scheduled path come to disagree about what a room allows.
//
// The room rules read three rows between them, so this reads them once and together rather than each rule
// Fetching its own row in turn — this is the only place that touches storage on the hot path (every message
// Send lands here, and a forward multiplies it by the room count). The sender's permissions come from their roles,
// Read once per permission however many rules ask about it.
//
// **This decision is free of side effects.** The word-filter arm hands back the filter it matched instead of
// Applying it, because a caller may need to re-run the decision for a message it has already stored — and an
// Automod action applied twice for one message is two timeouts and two audit rows.
export const getMessageCreationRejection = async (
  db: Database,
  userId: string,
  roomId: string,
  message?: string,
): Promise<MessageCreationRejection | undefined> => {
  const [room, member, filter] = await Promise.all([
    db.query.roomsInMessage.findFirst({
      columns: { isReadOnly: true, slowmodeMs: true },
      where: { id: { eq: roomId } },
    }),
    db.query.usersToRoomsInMessage.findFirst({
      columns: { lastMessageAt: true, timeoutUntil: true },
      where: { roomId: { eq: roomId }, userId: { eq: userId } },
    }),
    // Only read when there is text to filter: an attachment-only send has nothing for the word list to match,
    // And a forward multiplies every read here by the room count
    message
      ? db.query.roomFiltersInMessage.findFirst({
          columns: { action: true, timeoutDurationMs: true, words: true },
          where: { roomId: { eq: roomId } },
        })
      : undefined,
  ]);
  if (!room || !member) return { type: MessageCreationRejectionType.NotAMember };
  // A rule asks whether the sender holds a permission only when it engages, and however many rules ask about the
  // Same one, storage answers once — the promise is what is memoized, so concurrent askers share the one lookup
  const permissionPromiseMap = new Map<RoomPermission, Promise<boolean>>();
  const checkHasRoomPermission = (permission: RoomPermission): Promise<boolean> =>
    getOrCreate(permissionPromiseMap, permission, () => checkHasPermission(db, userId, roomId, permission));
  // A timeout outranks every permission — a moderator who times themselves out stays timed out
  if (member.timeoutUntil && member.timeoutUntil > new Date()) return { type: MessageCreationRejectionType.Timeout };
  else if (!(await checkHasRoomPermission(RoomPermission.SendMessages)))
    return { type: MessageCreationRejectionType.MissingPermission };
  else if (room.isReadOnly && !(await checkHasRoomPermission(RoomPermission.ManageMessages)))
    return { type: MessageCreationRejectionType.ReadOnly };
  else if (room.slowmodeMs && member.lastMessageAt && !(await checkHasRoomPermission(RoomPermission.ManageMessages))) {
    const elapsedMs = Date.now() - member.lastMessageAt.getTime();
    if (elapsedMs < room.slowmodeMs) return { type: MessageCreationRejectionType.Slowmode };
  }

  if (!message || !filter?.words.length) return undefined;

  const normalizedMessage = message.toLowerCase();
  if (!filter.words.some((word) => normalizedMessage.includes(word.toLowerCase()))) return undefined;
  else if (await checkHasRoomPermission(RoomPermission.ManageMessages)) return undefined;
  else return { filter, type: MessageCreationRejectionType.WordFilter };
};

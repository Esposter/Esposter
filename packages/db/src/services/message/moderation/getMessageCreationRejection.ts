import type { Database, RoomFilterInMessage } from "@esposter/db-schema";

import { checkHasPermission } from "#src/services/room/rbac/checkHasPermission";
import { MessageCreationRejectionType, RoomPermission } from "@esposter/db-schema";

export type MessageCreationRejection =
  | {
      filter: Pick<RoomFilterInMessage, "action" | "timeoutDurationMs">;
      type: MessageCreationRejectionType.WordFilter;
    }
  | { type: Exclude<MessageCreationRejectionType, MessageCreationRejectionType.WordFilter> };
// The gate every message-producing path decides with, in precedence order: a timeout outranks everything,
// Then the room's read-only flag, its slowmode, and finally the word filter. It returns the decision rather
// Than throwing so each caller can raise the error its own transport speaks — a tRPC code in the app, a
// Domain error in the Function worker — while the rules themselves exist exactly once. Two copies of these
// Rules is how the live path and the scheduled path come to disagree about what a room allows.
//
// The four rules read three rows between them, so this reads them once and together rather than each rule
// Fetching its own row in turn — this is the only place that touches storage on the hot path (every message
// Send lands here, and a forward multiplies it by the room count).
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
  // Only a rule that actually engages asks whether the sender may moderate, and however many of them ask,
  // Storage answers once — the promise is what is memoized, so concurrent askers share the one lookup. An
  // Unrestricted room is the common case and never asks at all
  let hasManageMessagesPromise: Promise<boolean> | undefined;
  const checkHasManageMessages = (): Promise<boolean> =>
    (hasManageMessagesPromise ??= checkHasPermission(db, userId, roomId, RoomPermission.ManageMessages));
  // A timeout outranks every permission — a moderator who times themselves out stays timed out
  if (member.timeoutUntil && member.timeoutUntil > new Date()) return { type: MessageCreationRejectionType.Timeout };
  else if (room.isReadOnly && !(await checkHasManageMessages())) return { type: MessageCreationRejectionType.ReadOnly };
  else if (room.slowmodeMs && member.lastMessageAt && !(await checkHasManageMessages())) {
    const elapsedMs = Date.now() - member.lastMessageAt.getTime();
    if (elapsedMs < room.slowmodeMs) return { type: MessageCreationRejectionType.Slowmode };
  }

  if (!message || !filter?.words.length) return undefined;

  const normalizedMessage = message.toLowerCase();
  if (!filter.words.some((word) => normalizedMessage.includes(word.toLowerCase()))) return undefined;
  else if (await checkHasManageMessages()) return undefined;
  return { filter, type: MessageCreationRejectionType.WordFilter };
};

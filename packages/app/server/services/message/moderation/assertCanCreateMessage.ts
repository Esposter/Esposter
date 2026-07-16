import type { Context } from "@@/server/trpc/context";

import { assertNotInSlowmode } from "@@/server/services/message/moderation/assertNotInSlowmode";
import { assertNotReadOnly } from "@@/server/services/message/moderation/assertNotReadOnly";
import { assertNotTimedOut } from "@@/server/services/message/moderation/assertNotTimedOut";
import { assertNotWordFiltered } from "@@/server/services/message/moderation/assertNotWordFiltered";
import { hasPermission } from "@@/server/services/room/rbac/hasPermission";
import { RoomPermission } from "@esposter/db-schema";

// The gate every message-producing path runs through, in precedence order: a timeout outranks everything,
// Then the room's read-only flag, its slowmode, and finally the word filter.
//
// The four rules read three rows between them, so this reads them once and together rather than each rule
// Fetching its own row in turn — the rules themselves are pure decisions over what it hands them, which is
// What keeps this the only place that touches storage on the hot path (every message send lands here, and
// A forward multiplies it by the room count).
export const assertCanCreateMessage = async (
  db: Context["db"],
  userId: string,
  roomId: string,
  message?: string,
): Promise<void> => {
  const [room, member, filter] = await Promise.all([
    db.query.roomsInMessage.findFirst({
      columns: { isReadOnly: true, slowmodeMs: true },
      where: { id: { eq: roomId } },
    }),
    db.query.usersToRoomsInMessage.findFirst({
      columns: { lastMessageAt: true, timeoutUntil: true },
      where: { roomId: { eq: roomId }, userId: { eq: userId } },
    }),
    db.query.roomFiltersInMessage.findFirst({ columns: { words: true }, where: { roomId: { eq: roomId } } }),
  ]);
  // Only a rule that actually engages asks whether the sender can moderate, and however many of them ask,
  // Storage answers once — the promise is what is memoized, so concurrent askers share the one lookup. An
  // Unrestricted room is the common case and never asks at all
  let canManageMessages: Promise<boolean> | undefined;
  const getCanManageMessages = (): Promise<boolean> =>
    (canManageMessages ??= hasPermission(db, userId, roomId, RoomPermission.ManageMessages));
  assertNotTimedOut(member);
  await assertNotReadOnly(room, getCanManageMessages);
  await assertNotInSlowmode(room, member, getCanManageMessages);
  if (message) await assertNotWordFiltered(filter, message, getCanManageMessages);
};

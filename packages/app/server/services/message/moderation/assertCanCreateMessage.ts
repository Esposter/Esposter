import type { Context } from "@@/server/trpc/context";

import { assertNotInSlowmode } from "@@/server/services/message/moderation/assertNotInSlowmode";
import { assertNotReadOnly } from "@@/server/services/message/moderation/assertNotReadOnly";
import { assertNotTimedOut } from "@@/server/services/message/moderation/assertNotTimedOut";
import { assertNotWordFiltered } from "@@/server/services/message/moderation/assertNotWordFiltered";

export const assertCanCreateMessage = async (db: Context["db"], userId: string, roomId: string, message?: string) => {
  await assertNotTimedOut(db, userId, roomId);
  await assertNotReadOnly(db, userId, roomId);
  await assertNotInSlowmode(db, userId, roomId);
  if (message) await assertNotWordFiltered(db, userId, roomId, message);
};

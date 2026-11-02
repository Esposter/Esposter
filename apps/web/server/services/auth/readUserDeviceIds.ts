import type { Context } from "#server/trpc/context";
import type { UserInAuth } from "@esposter/db-schema";

import { getDeviceId } from "#server/services/auth/getDeviceId";

// Every device the account holds, one per session row, expired rows included: a connection outlives the expiry of the
// Session that minted it, so an expired row still names a device that may be connected
export const readUserDeviceIds = async (db: Context["db"], userId: UserInAuth["id"]): Promise<string[]> => {
  const sessions = await db.query.sessionsInAuth.findMany({ columns: { id: true }, where: { userId: { eq: userId } } });
  return sessions.map(({ id: sessionId }) => getDeviceId({ sessionId, userId }));
};

import type { AuthedContext } from "#server/models/auth/AuthedContext";

import { auth } from "#server/auth";
import { closeDeviceConnections } from "#server/services/auth/closeDeviceConnections";
import { readActiveSessions } from "#server/services/auth/readActiveSessions";

// Ends every session the account holds, the one the request runs as included, so the person is signed out everywhere
// before the deletion is requested. Each session is revoked by the token it was read with, as `deleteSession` revokes
// one, and its live connections are closed the same way. Read first, so a session that has already expired is not revoked
export const deleteAccountSessions = async (ctx: AuthedContext): Promise<void> => {
  const { user } = ctx.getSessionPayload;
  const sessions = await readActiveSessions(ctx.db, user.id);
  await Promise.all(sessions.map(({ token }) => auth.api.revokeSession({ body: { token }, headers: ctx.headers })));
  await Promise.all(sessions.map(({ id }) => closeDeviceConnections({ sessionId: id, userId: user.id })));
};

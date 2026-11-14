import type { SessionSummary } from "#server/models/session/SessionSummary";

import { auth } from "#server/auth";
import { closeSessionWebSocketPeers } from "#server/services/auth/closeSessionWebSocketPeers";
import { getDeviceLabel } from "#server/services/auth/getDeviceLabel";
import { readActiveSessions } from "#server/services/auth/readActiveSessions";
import { router } from "#server/trpc";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { deleteSessionInputSchema } from "#shared/models/db/session/DeleteSessionInput";
import { DatabaseEntityType } from "@esposter/db-schema";

export const sessionRouter = router({
  deleteOtherSessions: standardAuthedProcedure.mutation<void>(async ({ ctx }) => {
    const { session, user } = ctx.getSessionPayload;
    // Read before the revoke, which leaves nothing to name the sessions it ended by
    const otherSessions = (await readActiveSessions(ctx.db, user.id)).filter(({ id }) => id !== session.id);
    await auth.api.revokeOtherSessions({ headers: ctx.headers });
    for (const { id } of otherSessions) closeSessionWebSocketPeers(id);
  }),
  deleteSession: standardAuthedProcedure.input(deleteSessionInputSchema).mutation<void>(async ({ ctx, input }) => {
    const { user } = ctx.getSessionPayload;
    // A session token is a credential, so it never reaches the client: a row is named by id and the token it is
    // Revoked with is resolved here. The read is scoped to the caller, so an id that is not theirs is a
    // NOT_FOUND rather than someone else's session being signed out
    const sessions = await readActiveSessions(ctx.db, user.id);
    const session = sessions.find(({ id }) => id === input);
    if (!session) throw getNotFoundError(DatabaseEntityType.Session, input);
    await auth.api.revokeSession({ body: { token: session.token }, headers: ctx.headers });
    closeSessionWebSocketPeers(session.id);
    // The session's push subscriptions went with the row better-auth just deleted — `pushSubscriptions.sessionId` cascades
  }),
  readSessions: standardAuthedProcedure.query<SessionSummary[]>(async ({ ctx }) => {
    const { session: currentSession, user } = ctx.getSessionPayload;
    const sessions = await readActiveSessions(ctx.db, user.id);
    return sessions.map(({ id, updatedAt, userAgent }) => ({
      deviceLabel: getDeviceLabel(userAgent ?? ""),
      id,
      isCurrent: id === currentSession.id,
      updatedAt,
    }));
  }),
});

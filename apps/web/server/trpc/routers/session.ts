import type { SessionSummary } from "@@/server/models/session/SessionSummary";

import { deleteSessionInputSchema } from "#shared/models/db/session/DeleteSessionInput";
import { auth } from "@@/server/auth";
import { closeDeviceConnections } from "@@/server/services/auth/closeDeviceConnections";
import { getDeviceLabel } from "@@/server/services/auth/getDeviceLabel";
import { readActiveSessions } from "@@/server/services/auth/readActiveSessions";
import { router } from "@@/server/trpc";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType } from "@esposter/db-schema";

export const sessionRouter = router({
  deleteOtherSessions: standardAuthedProcedure.mutation<void>(async ({ ctx }) => {
    const { session, user } = ctx.getSessionPayload;
    // Read before revoking: the ids are what the connection close below addresses, and afterwards there is
    // Nothing left to read them from
    const sessions = await readActiveSessions(ctx.db, user.id);
    const otherSessionIds = sessions.filter(({ id }) => id !== session.id).map(({ id }) => id);
    await auth.api.revokeOtherSessions({ headers: ctx.headers });
    await Promise.all(otherSessionIds.map((sessionId) => closeDeviceConnections({ sessionId, userId: user.id })));
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
    // The session's push subscriptions went with the row better-auth just deleted — `pushSubscriptions.sessionId`
    // Cascades — and its live connections are what the deletion leaves behind
    await closeDeviceConnections({ sessionId: session.id, userId: user.id });
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

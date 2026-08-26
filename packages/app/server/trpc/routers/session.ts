import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { SessionSummary } from "@@/server/models/session/SessionSummary";

import { auth } from "@@/server/auth";
import { closeDeviceConnections } from "@@/server/services/auth/closeDeviceConnections";
import { getDeviceLabel } from "@@/server/services/auth/getDeviceLabel";
import { router } from "@@/server/trpc";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType } from "@esposter/db-schema";
import { z } from "zod";

const sessionIdSchema = z.string().min(1);
// Better-auth's own `listSessions` sits behind its freshness middleware, which rejects a session older than
// `freshAge` — a day by default — so a reader who signed in yesterday could neither see their sessions nor revoke
// One. The rows are ours, so reading them is a plain query and only the writes go through better-auth, whose
// Revoke endpoints ask for a valid session rather than a fresh one
const readOwnSessions = (ctx: AuthedContext) =>
  ctx.db.query.sessions.findMany({
    // Expired rows are not sessions anyone is signed in with — better-auth's own listing filters them the same way
    where: { expiresAt: { gt: new Date() }, userId: { eq: ctx.getSessionPayload.user.id } },
  });

export const sessionRouter = router({
  deleteOtherSessions: standardAuthedProcedure.mutation<void>(async ({ ctx }) => {
    const { session, user } = ctx.getSessionPayload;
    // Read before revoking: the ids are what the connection close below addresses, and afterwards there is
    // Nothing left to read them from
    const sessions = await readOwnSessions(ctx);
    const otherSessionIds = sessions.filter(({ id }) => id !== session.id).map(({ id }) => id);
    await auth.api.revokeOtherSessions({ headers: ctx.headers });
    await Promise.all(otherSessionIds.map((sessionId) => closeDeviceConnections({ sessionId, userId: user.id })));
  }),
  deleteSession: standardAuthedProcedure.input(sessionIdSchema).mutation<void>(async ({ ctx, input }) => {
    const { user } = ctx.getSessionPayload;
    // A session token is a credential, so it never reaches the client: a row is named by id and the token it is
    // Revoked with is resolved here. The read is scoped to the caller, so an id that is not theirs is a
    // NOT_FOUND rather than someone else's session being signed out
    const sessions = await readOwnSessions(ctx);
    const session = sessions.find(({ id }) => id === input);
    if (!session) throw getNotFoundError(DatabaseEntityType.Session, input);
    await auth.api.revokeSession({ body: { token: session.token }, headers: ctx.headers });
    // The session's push subscriptions went with the row better-auth just deleted — `pushSubscriptions.sessionId`
    // Cascades — and its live connections are what the deletion leaves behind
    await closeDeviceConnections({ sessionId: session.id, userId: user.id });
  }),
  readSessions: standardAuthedProcedure.query<SessionSummary[]>(async ({ ctx }) => {
    const { session: currentSession } = ctx.getSessionPayload;
    const sessions = await readOwnSessions(ctx);
    return sessions.map(({ id, updatedAt, userAgent }) => ({
      deviceLabel: getDeviceLabel(userAgent ?? ""),
      id,
      isCurrent: id === currentSession.id,
      updatedAt,
    }));
  }),
});

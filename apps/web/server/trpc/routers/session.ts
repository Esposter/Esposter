import type { SessionSummary } from "#server/models/session/SessionSummary";
import type { User } from "better-auth";
import type { Topic } from "@esposter/db-schema";

import { auth } from "#server/auth";
import { getDeviceLabel } from "#server/services/auth/getDeviceLabel";
import { readActiveSessions } from "#server/services/auth/readActiveSessions";
import { closeSessionSockets } from "#server/services/realtime/closeSessionSockets";
import { router } from "#server/trpc";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { deleteSessionInputSchema } from "#shared/models/db/session/DeleteSessionInput";
import { getTopic } from "#shared/services/realtime/getTopic";
import { DatabaseEntityType, TopicKind } from "@esposter/db-schema";

// The signed-in sessions a user holds are one topic for the user
const sessionTopics = ({ ctx }: { ctx: { user: User } }): Topic[] => [getTopic(TopicKind.Session, ctx.user.id)];

export const sessionRouter = router({
  deleteOtherSessions: getTopicsProcedure(standardAuthedProcedure, sessionTopics).mutation<void>(async ({ ctx }) => {
    const { session, user } = ctx;
    // Read before the revoke, which leaves nothing to name the sessions it ended by
    const otherSessions = (await readActiveSessions(ctx.db, user.id)).filter(({ id }) => id !== session.id);
    await auth.api.revokeOtherSessions({ headers: ctx.headers });
    await closeSessionSockets(
      ctx.db,
      user.id,
      otherSessions.map(({ id }) => id),
    );
  }),
  deleteSession: getTopicsProcedure(
    standardAuthedProcedure.input(deleteSessionInputSchema),
    sessionTopics,
  ).mutation<void>(async ({ ctx, input }) => {
    const { user } = ctx;
    // A session token is a credential, so it never reaches the client: a row is named by id and the token it is
    // Revoked with is resolved here. The read is scoped to the caller, so an id that is not theirs is a
    // NOT_FOUND rather than someone else's session being signed out
    const sessions = await readActiveSessions(ctx.db, user.id);
    const session = sessions.find(({ id }) => id === input);
    if (!session) throw getNotFoundError(DatabaseEntityType.Session, input);
    await auth.api.revokeSession({ body: { token: session.token }, headers: ctx.headers });
    await closeSessionSockets(ctx.db, user.id, [session.id]);
    // The session's push subscriptions went with the row better-auth just deleted — `pushSubscriptions.sessionId` cascades
  }),
  readSessions: getTopicsProcedure(standardAuthedProcedure, sessionTopics).query<SessionSummary[]>(async ({ ctx }) => {
    const { session: currentSession, user } = ctx;
    const sessions = await readActiveSessions(ctx.db, user.id);
    return sessions.map(({ id, updatedAt, userAgent }) => ({
      deviceLabel: getDeviceLabel(userAgent ?? ""),
      id,
      isCurrent: id === currentSession.id,
      updatedAt,
    }));
  }),
});

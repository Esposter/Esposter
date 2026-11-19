import type { SessionSummary } from "#server/models/session/SessionSummary";

import { auth } from "#server/auth";
import { getDeviceLabel } from "#server/services/auth/getDeviceLabel";
import { readActiveSessions } from "#server/services/auth/readActiveSessions";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { router } from "#server/trpc/index";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { deleteSessionInputSchema } from "#shared/models/db/session/DeleteSessionInput";
import { DatabaseEntityType } from "@esposter/db-schema";

export const sessionRouter = router({
  // Each session the revoke removes closes its own sockets as its row goes (`server/auth.ts`)
  deleteOtherSessions: standardAuthedProcedure.mutation<void>(async ({ ctx }) => {
    await auth.api.revokeOtherSessions({ headers: ctx.headers });
  }),
  deleteSession: standardAuthedProcedure.input(deleteSessionInputSchema).mutation<void>(async ({ ctx, input }) => {
    const { user } = ctx;
    // A session token is a credential, so it never reaches the client: a row is named by id and the token it is
    // Revoked with is resolved here. The read is scoped to the caller, so an id that is not theirs is a
    // NOT_FOUND rather than someone else's session being signed out
    const sessions = await readActiveSessions(ctx.db, user.id);
    const session = sessions.find(({ id }) => id === input);
    if (!session) throw getNotFoundError(DatabaseEntityType.Session, input);
    await auth.api.revokeSession({ body: { token: session.token }, headers: ctx.headers });
    // Its sockets close with its row (`server/auth.ts`), and its push subscriptions cascade from the same row
  }),
  readSessions: standardAuthedProcedure.query<SessionSummary[]>(async ({ ctx }) => {
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

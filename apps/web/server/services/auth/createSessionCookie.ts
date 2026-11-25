import type { auth } from "#server/auth";
import type { SessionCookie } from "#server/models/auth/SessionCookie";

import { signSessionToken } from "#server/services/auth/signSessionToken";

// Signs one user in through better-auth's own context: its internal adapter creates the session, its secret signs the
// Token, and its session cookie definition names the cookie. The routes that mint a session for a fixed user share it,
// So each one only decides whether to answer
export const createSessionCookie = async (
  context: Awaited<typeof auth.$context>,
  userId: string,
): Promise<SessionCookie> => {
  const session = await context.internalAdapter.createSession(userId, false);
  const { attributes, name } = context.authCookies.sessionToken;
  return {
    // `better-auth's` sameSite admits a capitalised value that the cookie writer's type does not.
    /* oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The writer reads either case, so the attributes
       are the writer's own type */
    attributes: attributes as SessionCookie["attributes"],
    name,
    value: await signSessionToken(session.token, context.secret),
  };
};

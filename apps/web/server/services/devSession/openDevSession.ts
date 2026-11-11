import type { auth } from "#server/auth";
import type { DevSessionCookie } from "#server/models/devSession/DevSessionCookie";

import { checkIsDevSessionOpen } from "#server/services/devSession/checkIsDevSessionOpen";
import { signSessionToken } from "#server/services/devSession/signSessionToken";
import { DRIVEN_USER_ID } from "@esposter/shared";

// Signs the driven user in through better-auth's own context: its internal adapter creates the session, its secret signs
// The token and its session cookie definition names the cookie. A refused request resolves to undefined and writes nothing,
// Since the gate and the seeded-user check both run before the session is created
export const openDevSession = async (context: Awaited<typeof auth.$context>): Promise<DevSessionCookie | undefined> => {
  if (!checkIsDevSessionOpen()) return undefined;
  const user = await context.internalAdapter.findUserById(DRIVEN_USER_ID);
  if (!user) return undefined;
  const session = await context.internalAdapter.createSession(user.id, false);
  const { attributes, name } = context.authCookies.sessionToken;
  // Better-auth capitalises a same-site value that the cookie writer reads without regard to case
  return {
    attributes: attributes as DevSessionCookie["attributes"],
    name,
    value: await signSessionToken(session.token, context.secret),
  };
};

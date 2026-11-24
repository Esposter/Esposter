import type { auth } from "#server/auth";
import type { DevSessionCookie } from "#server/models/devSession/DevSessionCookie";

import { checkIsDevSessionOpen } from "#server/services/devSession/checkIsDevSessionOpen";
import { signSessionToken } from "#server/services/devSession/signSessionToken";
import { DRIVEN_USER_ID } from "@esposter/shared";

// Signs the driven user in through better-auth's own context: its internal adapter creates the session.
// Its secret signs the token, and its session cookie definition names the cookie.
// A refused request resolves to undefined and writes nothing.
// The gate and the seeded-user check both run before the session is created.
export const openDevSession = async (context: Awaited<typeof auth.$context>): Promise<DevSessionCookie | undefined> => {
  if (!checkIsDevSessionOpen()) return undefined;
  const user = await context.internalAdapter.findUserById(DRIVEN_USER_ID);
  if (!user) return undefined;
  const session = await context.internalAdapter.createSession(user.id, false);
  const { attributes, name } = context.authCookies.sessionToken;
  return {
    // `better-auth's` sameSite admits a capitalised value that the cookie writer's type does not.
    /* oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The writer reads either case, so the attributes
       are the writer's own type */
    attributes: attributes as DevSessionCookie["attributes"],
    name,
    value: await signSessionToken(session.token, context.secret),
  };
};

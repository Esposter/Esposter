import type { auth } from "#server/auth";
import type { SessionCookie } from "#server/models/auth/SessionCookie";

import { createSessionCookie } from "#server/services/auth/createSessionCookie";
import { checkIsHydrationCheckSecret } from "#server/services/hydrationCheck/checkIsHydrationCheckSecret";
import { HYDRATION_CHECK_USER_EMAIL, HYDRATION_CHECK_USER_ID } from "#server/services/hydrationCheck/constants";

// Signs the hydration check's own user in for one run of the check, creating the user on its first session. Only the
// Deploy holds the secret. Each run revokes the sessions the runs before it opened, so the user holds one session at a
// Time: an expiry cannot bound it, since better-auth extends a session that is read close to its end. A refused request
// Resolves to undefined and writes nothing
export const openHydrationCheckSession = async (
  context: Awaited<typeof auth.$context>,
  authorization: string,
): Promise<SessionCookie | undefined> => {
  if (!checkIsHydrationCheckSecret(authorization)) return undefined;
  const user =
    (await context.internalAdapter.findUserById(HYDRATION_CHECK_USER_ID)) ??
    (await context.internalAdapter.createUser(
      { email: HYDRATION_CHECK_USER_EMAIL, id: HYDRATION_CHECK_USER_ID, name: "Hydration check" },
      { method: "admin" },
    ));
  await context.internalAdapter.deleteUserSessions(user.id);
  return createSessionCookie(context, user.id);
};

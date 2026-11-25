import type { auth } from "#server/auth";
import type { SessionCookie } from "#server/models/auth/SessionCookie";

import { createSessionCookie } from "#server/services/auth/createSessionCookie";
import { checkIsDevSessionOpen } from "#server/services/devSession/checkIsDevSessionOpen";
import { DRIVEN_USER_ID } from "@esposter/shared";

// Signs the driven user in. A refused request resolves to undefined and writes nothing.
// The gate and the seeded-user check both run before the session is created.
export const openDevSession = async (context: Awaited<typeof auth.$context>): Promise<SessionCookie | undefined> => {
  if (!checkIsDevSessionOpen()) return undefined;
  const user = await context.internalAdapter.findUserById(DRIVEN_USER_ID);
  if (!user) return undefined;
  return createSessionCookie(context, user.id);
};

import { readSession } from "#server/services/auth/readSession";
import { forwardSocket } from "#server/services/realtime/forwardSocket";
import { readSocketValue } from "#server/services/realtime/readSocketValue";
import { deviceIdSchema } from "#shared/models/realtime/DeviceId";
import { env } from "cloudflare:workers";
import { createError, defineEventHandler, getQuery } from "nuxt/server";

// The person's own socket, which every signed-in page opens: the user object holds it for every tab the person has open
export default defineEventHandler(async (event) => {
  const authSession = await readSession(event.req.headers);
  if (!authSession) throw createError({ statusCode: 401 });

  const { deviceId } = readSocketValue(deviceIdSchema, getQuery(event));
  const { session, user } = authSession;
  return forwardSocket(env.USER.get(env.USER.idFromName(user.id)), event.req, {
    deviceId,
    sessionId: session.id,
    userId: user.id,
  });
});

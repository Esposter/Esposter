import { db } from "#server/db";
import { readSession } from "#server/services/auth/readSession";
import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { forwardSocket } from "#server/services/realtime/forwardSocket";
import { readSocketValue } from "#server/services/realtime/readSocketValue";
import { deviceIdSchema } from "#shared/models/realtime/DeviceId";
import { callSessionIdSchema } from "@esposter/db-schema";
import { env } from "cloudflare:workers";
import { createError, defineEventHandler, getQuery } from "nuxt/server";

// A call's socket, for a connection the call admits: the call object holds it with everyone joined to or knocking on the call
export default defineEventHandler(async (event) => {
  const sessionPayload = await readSession(event.req.headers);
  if (!sessionPayload) throw createError({ statusCode: 401 });

  const callSessionId = readSocketValue(callSessionIdSchema.shape.callSessionId, event.context.params?.callSessionId);
  const { deviceId } = readSocketValue(deviceIdSchema, getQuery(event));
  const { session, user } = sessionPayload;
  const isAdmitted = await checkIsCallConnectionAdmitted(db, callSessionId, user.id);
  if (!isAdmitted) throw createError({ statusCode: 403 });

  return forwardSocket(env.CALL.get(env.CALL.idFromName(callSessionId)), event.req, {
    deviceId,
    sessionId: session.id,
    userId: user.id,
  });
});

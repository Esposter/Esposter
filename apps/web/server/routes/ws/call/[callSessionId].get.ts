import { useCallObject } from "#server/composables/realtime/useCallObject";
import { db } from "#server/db/index";
import { readSocketSession } from "#server/services/auth/readSocketSession";
import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { forwardSocket } from "#server/services/realtime/forwardSocket";
import { readSocketValue } from "#server/services/realtime/readSocketValue";
import { deviceIdSchema } from "#shared/models/realtime/DeviceId";
import { callSessionIdSchema } from "@esposter/db-schema";
import { createError, defineEventHandler, getQuery } from "nuxt/server";

// A call's socket, for a connection the call admits: the call object holds it with everyone joined to or knocking on the call
export default defineEventHandler(async (event) => {
  const authSession = await readSocketSession(event);

  const callSessionId = readSocketValue(callSessionIdSchema.shape.callSessionId, event.context.params?.callSessionId);
  const { deviceId } = readSocketValue(deviceIdSchema, getQuery(event));
  const { session, user } = authSession;
  const isAdmitted = await checkIsCallConnectionAdmitted(db, callSessionId, user.id);
  if (!isAdmitted) throw createError({ statusCode: 403 });

  return forwardSocket(event, useCallObject(callSessionId), {
    deviceId,
    sessionExpiresAt: session.expiresAt.getTime(),
    sessionId: session.id,
    userId: user.id,
  });
});

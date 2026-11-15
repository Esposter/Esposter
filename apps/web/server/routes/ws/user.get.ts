import { useUserObject } from "#server/composables/realtime/useUserObject";
import { readSocketSession } from "#server/services/auth/readSocketSession";
import { forwardSocket } from "#server/services/realtime/forwardSocket";
import { readSocketValue } from "#server/services/realtime/readSocketValue";
import { deviceIdSchema } from "#shared/models/realtime/DeviceId";
import { defineEventHandler, getQuery } from "nuxt/server";

// The person's own socket, which every signed-in page opens: the user object holds it for every tab the person has open
export default defineEventHandler(async (event) => {
  const { session, user } = await readSocketSession(event);

  const { deviceId } = readSocketValue(deviceIdSchema, getQuery(event));
  return forwardSocket(event, useUserObject(user.id), { deviceId, sessionId: session.id, userId: user.id });
});

import { db } from "#server/db";
import { readSession } from "#server/services/auth/readSession";
import { forwardSocket } from "#server/services/realtime/forwardSocket";
import { readSocketValue } from "#server/services/realtime/readSocketValue";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { deviceIdSchema } from "#shared/models/realtime/DeviceId";
import { selectRoomInMessageSchema } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { env } from "cloudflare:workers";
import { createError, defineEventHandler, getQuery } from "nuxt/server";

// A room's socket, for a member of the room. The check that fails is refused rather than served, and carries its cause:
// A database fault closes the socket the same way a non-member's attempt does
export default defineEventHandler(async (event) => {
  const sessionPayload = await readSession(event.req.headers);
  if (!sessionPayload) throw createError({ statusCode: 401 });

  const roomId = readSocketValue(selectRoomInMessageSchema.shape.id, event.context.params?.roomId);
  const { deviceId } = readSocketValue(deviceIdSchema, getQuery(event));
  await getResultAsync(() => assertIsMember(db, sessionPayload, roomId)).match(noop, (error) => {
    throw createError({ cause: error, message: "Forbidden", statusCode: 403 });
  });
  return forwardSocket(env.ROOM.get(env.ROOM.idFromName(roomId)), event.req, {
    deviceId,
    sessionId: sessionPayload.session.id,
    userId: sessionPayload.user.id,
  });
});

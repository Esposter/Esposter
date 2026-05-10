import { assertIsRoom } from "@@/server/services/room/assertIsRoom";
import { middleware } from "@@/server/trpc";

export const isRoom = middleware(async ({ ctx, input, next }) => {
  const roomId = typeof input === "string" ? input : (input as { roomId?: string }).roomId;
  if (roomId) await assertIsRoom(ctx.db, roomId);
  return next();
});

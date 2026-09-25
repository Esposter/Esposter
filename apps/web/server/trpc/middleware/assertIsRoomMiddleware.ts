import { assertIsRoom } from "@@/server/services/room/assertIsRoom";
import { middleware } from "@@/server/trpc";
import { requireUuid } from "@@/server/trpc/guards/requireUuid";
import { DatabaseEntityType } from "@esposter/db-schema";

// The room id is the bare input or its `roomId`, and an input carrying neither is rejected rather than let
// Through: a procedure whose room key is spelled any other way would otherwise pass unchecked on every call
export const assertIsRoomMiddleware = middleware(async ({ ctx, input, next }) => {
  const roomId = requireUuid(
    typeof input === "string" ? input : (input as { roomId?: unknown }).roomId,
    DatabaseEntityType.Room,
  );
  await assertIsRoom(ctx.db, roomId);
  return next();
});

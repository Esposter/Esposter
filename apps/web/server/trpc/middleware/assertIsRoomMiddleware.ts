import { assertIsRoom } from "#server/services/room/assertIsRoom";
import { requireUuid } from "#server/trpc/guards/requireUuid";
import { middleware } from "#server/trpc/index";
import { DatabaseEntityType } from "@esposter/db-schema";

// The room id is the bare input or its `roomId`, and an input carrying neither is rejected rather than let
// Through: a procedure whose room key is spelled any other way would otherwise pass unchecked on every call
const getRoomIdOf = (input: unknown): unknown => {
  if (typeof input === "string") return input;
  if (typeof input === "object" && input !== null && "roomId" in input) return input.roomId;
  return undefined;
};

export const assertIsRoomMiddleware = middleware(async ({ ctx, input, next }) => {
  const roomId = requireUuid(getRoomIdOf(input), DatabaseEntityType.Room);
  await assertIsRoom(ctx.db, roomId);
  return next();
});

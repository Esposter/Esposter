import type { RoomFilterInMessage } from "@esposter/db-schema";

import { upsertRoomFilterInputSchema } from "#shared/models/db/room/UpsertRoomFilterInput";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import {
  DatabaseEntityType,
  roomFiltersInMessage,
  roomIdSchema,
  RoomPermission,
  WordFilterAction,
} from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const filterRouter = router({
  // Gated like the write it sits beside, rather than at membership: the banned words *are* the filter, so a
  // Member who can read them can spell around every one of them
  readRoomFilter: getPermissionsProcedure(RoomPermission.ManageRoom, roomIdSchema, "roomId").query<
    RoomFilterInMessage | undefined
  >(({ ctx, input: { roomId } }) => ctx.db.query.roomFiltersInMessage.findFirst({ where: { roomId: { eq: roomId } } })),
  upsertRoomFilter: getPermissionsProcedure(
    RoomPermission.ManageRoom,
    upsertRoomFilterInputSchema,
    "roomId",
  ).mutation<RoomFilterInMessage>(async ({ ctx, input: { action, roomId, timeoutDurationMs, words } }) => {
    // A duration only belongs to a Timeout action — clear it for every other action so a stale value
    // Can never re-arm a timeout after the action is switched back.
    const set = { action, timeoutDurationMs: action === WordFilterAction.Timeout ? timeoutDurationMs : null, words };
    return requireMutation(
      (
        await ctx.db
          .insert(roomFiltersInMessage)
          .values({ ...set, roomId })
          .onConflictDoUpdate({ set, target: roomFiltersInMessage.roomId })
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.RoomFilter,
      roomId,
    );
  }),
});

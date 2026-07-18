import { upsertRoomFilterInputSchema } from "#shared/models/db/room/UpsertRoomFilterInput";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
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
  readRoomFilter: getMemberProcedure(roomIdSchema, "roomId").query(
    async ({ ctx, input: { roomId } }) =>
      (await ctx.db.query.roomFiltersInMessage.findFirst({ where: { roomId: { eq: roomId } } })) ?? null,
  ),
  upsertRoomFilter: getPermissionsProcedure(RoomPermission.ManageRoom, upsertRoomFilterInputSchema, "roomId").mutation(
    async ({ ctx, input: { action, roomId, timeoutDurationMs, words } }) => {
      // A duration only belongs to a Timeout action — clear it for every other action so a stale value
      // Can never re-arm a timeout after the action is switched back.
      const resolvedTimeoutDurationMs = action === WordFilterAction.Timeout ? timeoutDurationMs : null;
      const values = { action, roomId, timeoutDurationMs: resolvedTimeoutDurationMs, words };
      const updatedFilter = requireMutation(
        (
          await ctx.db
            .insert(roomFiltersInMessage)
            .values(values)
            .onConflictDoUpdate({
              set: { action, timeoutDurationMs: resolvedTimeoutDurationMs, words },
              target: roomFiltersInMessage.roomId,
            })
            .returning()
        )[0],
        Operation.Update,
        DatabaseEntityType.RoomFilter,
        roomId,
      );
      return updatedFilter;
    },
  ),
});

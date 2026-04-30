import { upsertRoomFilterInputSchema } from "#shared/models/db/room/UpsertRoomFilterInput";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { DatabaseEntityType, roomFiltersInMessage, roomIdSchema, RoomPermission } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

export const roomFilterRouter = router({
  readRoomFilter: getMemberProcedure(roomIdSchema, "roomId").query(async ({ ctx, input: { roomId } }) => {
    const filter = await ctx.db.query.roomFiltersInMessage.findFirst({
      where: { roomId: { eq: roomId } },
    });
    return filter?.words ?? [];
  }),
  upsertRoomFilter: getPermissionsProcedure(RoomPermission.ManageRoom, upsertRoomFilterInputSchema, "roomId").mutation(
    async ({ ctx, input: { roomId, words } }) => {
      const [updatedFilter] = await ctx.db
        .insert(roomFiltersInMessage)
        .values({ roomId, words })
        .onConflictDoUpdate({ set: { words }, target: roomFiltersInMessage.roomId })
        .returning();
      if (!updatedFilter)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.RoomFilter, roomId).message,
        });
      return updatedFilter;
    },
  ),
});

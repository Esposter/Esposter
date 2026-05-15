import { upsertRoomFilterInputSchema } from "#shared/models/db/room/UpsertRoomFilterInput";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { DatabaseEntityType, roomFiltersInMessage, roomIdSchema, RoomPermission } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const filterRouter = router({
  readRoomFilter: getMemberProcedure(roomIdSchema, "roomId").query(async ({ ctx, input: { roomId } }) => {
    const filter = await ctx.db.query.roomFiltersInMessage.findFirst({
      where: { roomId: { eq: roomId } },
    });
    return filter?.words ?? [];
  }),
  upsertRoomFilter: getPermissionsProcedure(RoomPermission.ManageRoom, upsertRoomFilterInputSchema, "roomId").mutation(
    async ({ ctx, input: { roomId, words } }) => {
      const updatedFilter = requireMutation(
        (
          await ctx.db
            .insert(roomFiltersInMessage)
            .values({ roomId, words })
            .onConflictDoUpdate({ set: { words }, target: roomFiltersInMessage.roomId })
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
